const https = require("https");
const User = require("../models/userModel");
const Assistant = require("../models/assistantModel");
const {
  createAssistantAPI,
  getAssistantFromVapi,
  deleteAssistantAPI,
  patchAssistantAPI,
} = require("../utils/apiClient");

// Create Assistant
const createAssistant = async (req, res) => {
  try {
    const assistantData = req.body;
    const { userId } = req.body;

    // Basic validation
    if (!assistantData.name) {
      return res.status(400).json({ error: "Assistant name is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Create a copy of assistantData without userId for VAPI
    const { userId: _, ...vapiAssistantData } = assistantData;
    
    // First, create the assistant in VAPI (without userId)
    const vapiResponse = await createAssistantAPI(vapiAssistantData);
    console.log('createAssistant vapiResponse:', vapiResponse);
    
    if (!vapiResponse || !vapiResponse.id) {
      return res.status(500).json({ error: "Failed to create assistant with VAPI" });
    }

    // Create a new assistant document in our database
    const assistant = new Assistant({
      userId: userId,  // Store userId in our database
      vapiAssistantId: vapiResponse.id, // Store the VAPI assistant ID
      name: vapiResponse.name,
      voice: vapiResponse.voice,
      model: vapiResponse.model,
      firstMessage: vapiResponse.firstMessage,
      voicemailMessage: vapiResponse.voicemailMessage,
      endCallMessage: vapiResponse.endCallMessage,
      transcriber: vapiResponse.transcriber,
      clientMessages: vapiResponse.clientMessages || [],
      serverMessages: vapiResponse.serverMessages || [],
      endCallPhrases: vapiResponse.endCallPhrases || [],
      recordingEnabled: vapiResponse.recordingEnabled || false,
      isServerUrlSecretSet: vapiResponse.isServerUrlSecretSet || false,
      createdAt: new Date(vapiResponse.createdAt) || new Date(),
      updatedAt: new Date(vapiResponse.updatedAt) || new Date()
    });

    // Save the assistant to our database
    const savedAssistant = await assistant.save();

    // Return the saved assistant data
    res.status(201).json({
      message: "Assistant created successfully",
      assistant: { 
        ...vapiResponse,
        _id: savedAssistant._id  // Include our database ID
      }
    });
  } catch (error) {
    console.error("Error creating assistant:", error);
    res.status(500).json({ error: "Failed to create assistant", details: error.message });
  }
};
// Get All Assistants (from VAPI)
const getAssistant = async (req, res) => {
  try {
    const vapiData = await getAssistantFromVapi();
    res.status(200).json(vapiData);
  } catch (error) {
    console.error("Error in getAssistant API:", error);
    res.status(500).json({ error: "Failed to retrieve assistants", details: error.message });
  }
};

// Update Assistant (Existing PUT method)
const updateAssistant = async (req, res) => {
  try {
    const {
      assistantId,
      name,
      firstMessage,
      endCallMessage,
      voicemailMessage,
      model,
      voice,
      recordingEnabled,
      toolIds,
    } = req.body;

    if (!assistantId) {
      return res.status(400).json({ error: "Assistant ID is required" });
    }

    const assistantDoc = await Assistant.findOne({ vapiAssistantId: assistantId });
    if (!assistantDoc) {
      return res.status(404).json({ error: "Assistant not found" });
    }

    const updatedAssistantData = {
      id: assistantId,
      name: name || assistantDoc.name,
      voice: voice || assistantDoc.voice,
      model: model || assistantDoc.model,
      recordingEnabled: recordingEnabled !== undefined ? recordingEnabled : assistantDoc.recordingEnabled,
      firstMessage: firstMessage || assistantDoc.firstMessage,
      voicemailMessage: voicemailMessage || assistantDoc.voicemailMessage,
      endCallMessage: endCallMessage || assistantDoc.endCallMessage,
      transcriber: assistantDoc.transcriber,
      clientMessages: assistantDoc.clientMessages,
      serverMessages: assistantDoc.serverMessages,
      endCallPhrases: assistantDoc.endCallPhrases,
      tools: toolIds
        ? [{ type: "make", function: { name: "AppointmentBooking" }, server: { url: "https://hook.us2.make.com/vhdou3ejrtbha9gs7fheoss71137nnlk" } }]
        : undefined,
    };

    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
      },
      body: JSON.stringify(updatedAssistantData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update assistant:", errorData);
      return res.status(response.status).json({ error: "Failed to update assistant", details: errorData });
    }

    const data = await response.json();
    assistantDoc.name = data.name;
    assistantDoc.firstMessage = data.firstMessage;
    assistantDoc.endCallMessage = data.endCallMessage;
    assistantDoc.voicemailMessage = data.voicemailMessage;
    assistantDoc.model = data.model;
    assistantDoc.voice = data.voice;
    assistantDoc.recordingEnabled = data.recordingEnabled;
    assistantDoc.updatedAt = new Date(data.updatedAt || Date.now());
    await assistantDoc.save();

    res.status(200).json({ message: "Assistant updated successfully", assistant: data });
  } catch (error) {
    console.error("Error updating assistant:", error.message);
    res.status(500).json({ error: "Failed to update assistant", details: error.message });
  }
};

const getAssistantbysuerid = async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Step 1: Fetch assistants from our database where userId matches
    const dbAssistants = await Assistant.find({ userId: userid });
    
    // Step 2: Fetch all assistants from VAPI to get the latest data
    const vapiAssistants = await getAssistantFromVapi();

    if (!dbAssistants || dbAssistants.length === 0) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    // Step 3: Map our database assistants to include the latest VAPI data
    const enhancedAssistants = dbAssistants.map(dbAssistant => {
      // Find the corresponding VAPI assistant
      const vapiAssistant = vapiAssistants.find(
        va => va.id === dbAssistant.vapiAssistantId
      );

      if (vapiAssistant) {
        // Return a merged object with both data sources
        return {
          id: dbAssistant.vapiAssistantId, // Use VAPI ID as the frontend ID
          _id: dbAssistant._id.toString(),  // MongoDB ID
          name: vapiAssistant.name || dbAssistant.name,
          voice: vapiAssistant.voice || dbAssistant.voice,
          model: vapiAssistant.model || dbAssistant.model,
          firstMessage: vapiAssistant.firstMessage || dbAssistant.firstMessage,
          endCallMessage: vapiAssistant.endCallMessage || dbAssistant.endCallMessage,
          voicemailMessage: vapiAssistant.voicemailMessage || dbAssistant.voicemailMessage,
          recordingEnabled: vapiAssistant.recordingEnabled || dbAssistant.recordingEnabled,
          createdAt: vapiAssistant.createdAt || dbAssistant.createdAt,
          updatedAt: vapiAssistant.updatedAt || dbAssistant.updatedAt
        };
      } else {
        // VAPI assistant might have been deleted, but we still return our DB data
        return {
          id: dbAssistant.vapiAssistantId,
          _id: dbAssistant._id.toString(),
          name: dbAssistant.name,
          voice: dbAssistant.voice,
          model: dbAssistant.model,
          firstMessage: dbAssistant.firstMessage,
          endCallMessage: dbAssistant.endCallMessage,
          voicemailMessage: dbAssistant.voicemailMessage,
          recordingEnabled: dbAssistant.recordingEnabled,
          createdAt: dbAssistant.createdAt,
          updatedAt: dbAssistant.updatedAt
        };
      }
    });

    res.status(200).json(enhancedAssistants);
  } catch (error) {
    console.error("Error fetching assistants by user ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Assistant
const deleteAssistant = async (req, res) => {
  try {
    const { assistantId } = req.params;

    if (!assistantId) {
      return res.status(400).json({ error: "Assistant ID is required" });
    }

    // Step 1: Delete from VAPI first
    const vapiResponse = await deleteAssistantAPI(assistantId);
    if (!vapiResponse || !vapiResponse.id) {
      return res.status(500).json({ error: "Failed to delete assistant from VAPI" });
    }

    // Step 2: If successful with VAPI, delete from our database
    const deletedAssistant = await Assistant.findOneAndDelete({ vapiAssistantId: assistantId });
    
    if (!deletedAssistant) {
      // We still return success even if not found in our DB, as it was deleted from VAPI
      console.warn(`Assistant with vapiAssistantId ${assistantId} not found in database`);
    }

    res.status(200).json({ 
      message: "Assistant deleted successfully", 
      assistant: vapiResponse 
    });
  } catch (error) {
    console.error("Error deleting assistant:", error);
    res.status(500).json({ error: "Failed to delete assistant", details: error.message });
  }
};

// Patch Assistant (Update specific fields)
const patchAssistant = async (req, res) => {
  try {
    const { assistantId } = req.params;
    const updateData = req.body;

    if (!assistantId) {
      return res.status(400).json({ error: "Assistant ID is required" });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    const vapiResponse = await patchAssistantAPI(assistantId, updateData);
    console.log('patchAssistant vapiResponse:', vapiResponse);

    res.status(200).json({
      message: "Assistant updated successfully",
      assistant: vapiResponse,
    });
  } catch (error) {
    console.error("Error updating assistant:", error);
    res.status(500).json({ error: "Failed to update assistant", details: error.message });
  }
};

module.exports = { createAssistant, getAssistant, updateAssistant, deleteAssistant, patchAssistant, getAssistantbysuerid };