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

    // Basic validation
    if (!assistantData.name) {
      return res.status(400).json({ error: "Assistant name is required" });
    }

    const vapiResponse = await createAssistantAPI(assistantData);
    console.log('createAssistant vapiResponse:', vapiResponse);

    res.status(201).json({
      message: "Assistant created successfully",
      assistant: vapiResponse,
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

// Delete Assistant
const deleteAssistant = async (req, res) => {
  try {
    const { assistantId } = req.params;

    if (!assistantId) {
      return res.status(400).json({ error: "Assistant ID is required" });
    }

    const assistantDoc = await Assistant.findOne({ vapiAssistantId: assistantId });
    if (!assistantDoc) {
      return res.status(404).json({ error: "Assistant not found in database" });
    }

    // Delete from VAPI first
    const vapiResponse = await deleteAssistantAPI(assistantId);
    if (!vapiResponse.id) {
      return res.status(500).json({ error: "Failed to delete assistant from VAPI" });
    }

    // Only delete from local DB after successful VAPI response
    await Assistant.deleteOne({ vapiAssistantId: assistantId });

    res.status(200).json({ message: "Assistant deleted successfully", assistant: vapiResponse });
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

module.exports = { createAssistant, getAssistant, updateAssistant, deleteAssistant, patchAssistant };