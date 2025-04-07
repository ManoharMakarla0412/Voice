const https = require("https");
const User = require("../models/userModel");
const Assistant = require("../models/assistantModel");
const {
  createAssistantAPI,
  getAssistantFromVapi,
} = require("../utils/apiClient");

// Create Assistant
const createAssistant = async (req, res) => {
  try {
    const {
      firstMessage,
      modelProvider,
      modelName,
      content,
      knowledgeBaseUrl,
      endCallMessage,
      messages,
      name,
      toolIds,
    } = req.body;
    const userId = req.user.id; // From JWT middleware

    if (content && content.length > 100000000) {
      return res.status(400).json({ error: "Content is too large" });
    }

    // Create assistant via VAPI API
    const vapiResponse = await createAssistantAPI(
      firstMessage,
      modelProvider,
      modelName,
      messages,
      knowledgeBaseUrl,
      endCallMessage,
      name,
      toolIds
    );
    if (!vapiResponse.id) {
      return res
        .status(500)
        .json({ error: "Failed to get assistant ID from VAPI" });
    }

    // Save assistant to database
    const assistant = new Assistant({
      userId: userId,
      vapiAssistantId: vapiResponse.id,
      name: name || vapiResponse.name,
      firstMessage,
      model: {
        model: modelName || vapiResponse.model?.model,
        messages: messages || vapiResponse.model?.messages || [],
        provider: modelProvider || vapiResponse.model?.provider,
        toolIds: toolIds || vapiResponse.model?.toolIds || [],
      },
      endCallMessage,
      voicemailMessage:
        vapiResponse.voicemailMessage || "Please call back later.",
      recordingEnabled: vapiResponse.recordingEnabled || false,
      updatedAt: new Date(),
    });
    await assistant.save();

    // Update user to indicate they have at least one assistant (optional)
    const user = await User.findById(userId);
    if (!user.assistant) {
      user.assistant = true;
      await user.save();
    }

    res
      .status(200)
      .json({ message: "Assistant created successfully", assistant });
  } catch (error) {
    console.error("Error creating assistant:", error);
    res
      .status(500)
      .json({ error: "Failed to create assistant", details: error.message });
  }
};

// Get All Assistants (from VAPI)
const getAssistant = async (req, res) => {
  try {
    const vapiData = await getAssistantFromVapi();
    res.status(200).json(vapiData);
  } catch (error) {
    console.error("Error in getAssistant API:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve assistants", details: error.message });
  }
};

// Update Assistant
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

    const assistantDoc = await Assistant.findOne({
      vapiAssistantId: assistantId,
    });
    if (!assistantDoc) {
      return res.status(404).json({ error: "Assistant not found" });
    }

    const updatedAssistantData = {
      id: assistantId,
      name: name || assistantDoc.name,
      voice: voice || assistantDoc.voice,
      model: model || assistantDoc.model,
      recordingEnabled:
        recordingEnabled !== undefined
          ? recordingEnabled
          : assistantDoc.recordingEnabled,
      firstMessage: firstMessage || assistantDoc.firstMessage,
      voicemailMessage: voicemailMessage || assistantDoc.voicemailMessage,
      endCallMessage: endCallMessage || assistantDoc.endCallMessage,
      transcriber: assistantDoc.transcriber,
      clientMessages: assistantDoc.clientMessages,
      serverMessages: assistantDoc.serverMessages,
      endCallPhrases: assistantDoc.endCallPhrases,
      tools: toolIds
        ? [
            {
              type: "make",
              function: { name: "AppointmentBooking" },
              server: {
                url: "https://hook.us2.make.com/vhdou3ejrtbha9gs7fheoss71137nnlk",
              },
            },
          ]
        : undefined,
    };

    const response = await fetch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        },
        body: JSON.stringify(updatedAssistantData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update assistant:", errorData);
      return res
        .status(response.status)
        .json({ error: "Failed to update assistant", details: errorData });
    }

    const data = await response.json();
    assistantDoc.name = data.name;
    assistantDoc.firstMessage = data.firstMessage;
    assistantDoc.endCallMessage = data.endCallMessage;
    assistantDoc.voicemailMessage = data.voicemailMessage;
    assistantDoc.model = data.model;
    assistantDoc.voice = data.voice;
    assistantDoc.recordingEnabled = data.recordingEnabled;
    assistantDoc.updatedAt = new Date();
    await assistantDoc.save();

    res
      .status(200)
      .json({ message: "Assistant updated successfully", assistant: data });
  } catch (error) {
    console.error("Error updating assistant:", error.message);
    res
      .status(500)
      .json({ error: "Failed to update assistant", details: error.message });
  }
};

module.exports = { createAssistant, getAssistant, updateAssistant };
