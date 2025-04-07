const CallLog = require("../models/calllogsModel");
const Assistant = require("../models/assistantModel");
const jwt = require("jsonwebtoken");

exports.handleCallWebhook = async (req, res) => {
  const event = req.body.message;
  if (!event || !event.type) {
    console.error("Invalid webhook payload:", req.body);
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  const { type, call, assistant, startedAt, endedAt, durationMinutes, cost } =
    event;

  try {
    let assistantDoc = await Assistant.findOne({
      vapiAssistantId: call.assistantId,
    });
    let userId = null;
    if (!assistantDoc && call.assistantId) {
      console.warn(
        `No Assistant found for vapiAssistantId: ${call.assistantId}, saving call without user mapping`
      );
    } else if (assistantDoc) {
      userId = assistantDoc.userId;
    }

    if (type === "status-update" && event.status === "in-progress") {
      const existingCall = await CallLog.findOne({ callId: call.id });
      if (!existingCall) {
        const newCallLog = new CallLog({
          callId: call.id,
          orgId: call.orgId,
          type: call.type,
          startedAt: new Date(call.createdAt),
          status: "ongoing",
          customerNumber: null,
          assistantId: call.assistantId || null,
          assistant: assistant
            ? {
                name: assistant.name,
                firstMessage: assistant.firstMessage,
                voiceProvider: assistant.voice?.provider,
                voiceId: assistant.voice?.voiceId,
              }
            : {},
          updatedAt: new Date(),
        });
        await newCallLog.save();
        console.log(`Call ${call.id} started and saved`);
      }
    } else if (type === "status-update" && event.status === "ended") {
      const callLog = await CallLog.findOne({ callId: call.id });
      if (callLog) {
        callLog.endedAt = new Date();
        callLog.status = "completed";
        callLog.updatedAt = new Date();
        await callLog.save();
        console.log(`Call ${call.id} ended (preliminary update)`);
      }
    } else if (type === "end-of-call-report") {
      const callLog = await CallLog.findOne({ callId: call.id });
      if (callLog) {
        callLog.startedAt = new Date(startedAt);
        callLog.endedAt = new Date(endedAt);
        callLog.minutes = durationMinutes;
        callLog.cost = cost;
        callLog.status = "completed";
        callLog.updatedAt = new Date();
        await callLog.save();

        if (userId) {
          const io = req.app.get("socketio");
          io.to(userId.toString()).emit("callUpdate", {
            callId: call.id,
            status: callLog.status,
            minutes: callLog.minutes,
            cost: callLog.cost,
          });
        }
        console.log(`Call ${call.id} fully updated with report`);
      } else {
        const newCallLog = new CallLog({
          callId: call.id,
          orgId: call.orgId,
          type: call.type,
          startedAt: new Date(startedAt),
          endedAt: new Date(endedAt),
          minutes: durationMinutes,
          cost: cost,
          status: "completed",
          customerNumber: null,
          assistantId: call.assistantId || null,
          assistant: assistant
            ? {
                name: assistant.name,
                firstMessage: assistant.firstMessage,
                voiceProvider: assistant.voice?.provider,
                voiceId: assistant.voice?.voiceId,
              }
            : {},
          updatedAt: new Date(),
        });
        await newCallLog.save();
        console.log(`Call ${call.id} created from end-of-call-report`);
      }
    }

    res.status(200).json({ message: "Webhook event processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res
      .status(500)
      .json({ error: "Webhook processing failed", details: error.message });
  }
};

exports.createCall = async (req, res) => {
  try {
    const { assistantId, phoneNumberId, name, customerNumber } = req.body;

    if (!assistantId || !phoneNumberId || !name || !customerNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assistantDoc = await Assistant.findOne({
      vapiAssistantId: assistantId,
    });
    if (!assistantDoc) {
      return res.status(404).json({ error: "Assistant not found" });
    }

    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId,
        phoneNumberId,
        name,
        customer: { number: customerNumber },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("VAPI Error:", result);
      return res
        .status(response.status)
        .json({ error: "Failed to create call", details: result });
    }

    const newCallLog = new CallLog({
      callId: result.id,
      orgId: result.orgId,
      type: result.type,
      startedAt: result.startedAt ? new Date(result.startedAt) : null,
      status: result.status || "ongoing",
      phoneCallProvider: result.phoneCallProvider,
      customerNumber: result.customer?.number,
      assistantId: result.assistantId || null,
      assistant: result.assistant
        ? {
            name: result.assistant.name,
            firstMessage: result.assistant.firstMessage,
            voiceProvider: result.assistant.voice?.provider,
            voiceId: result.assistant.voice?.voiceId,
          }
        : {},
      updatedAt: new Date(),
    });
    await newCallLog.save();

    res.status(201).json({
      message: "Call created successfully",
      callLog: newCallLog,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};

exports.getCallLogs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const assistants = await Assistant.find({ userId: decoded.id });
    const assistantIds = assistants.map((a) => a.vapiAssistantId);

    const callLogs = await CallLog.find({ assistantId: { $in: assistantIds } });
    res.status(200).json({
      message: "Call logs retrieved successfully",
      callLogs,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};

exports.getCallById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.vapi.ai/call/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("VAPI Error:", result);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch call", details: result });
    }

    res.status(200).json({
      message: "Call retrieved successfully",
      call: result,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};

// Replace the existing getCallStats function in callController.js with this
exports.getCallStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const assistants = await Assistant.find({ userId: decoded.id });
    const assistantIds = assistants.map((a) => a.vapiAssistantId);

    // Aggregate call stats with weekday breakdown
    const callStats = await CallLog.aggregate([
      {
        $match: {
          assistantId: { $in: assistantIds },
          startedAt: { $exists: true, $ne: null }, // Ensure startedAt exists
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$startedAt", // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
          },
          totalCalls: { $sum: 1 },
          totalMinutes: { $sum: "$minutes" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by day of week (Sunday to Saturday)
      },
    ]);

    // Initialize arrays for calls and minutes per day (Monday = 0, Sunday = 6)
    const callsByDay = Array(7).fill(0);
    const minutesByDay = Array(7).fill(0);
    let overallTotalCalls = 0;
    let overallTotalMinutes = 0;

    // Map MongoDB's day-of-week (1=Sun, 7=Sat) to desired order (0=Mon, 6=Sun)
    callStats.forEach((stat) => {
      const mongoDayIndex = stat._id; // 1=Sun, 2=Mon, ..., 7=Sat
      const adjustedIndex = (mongoDayIndex + 5) % 7; // Shift: 2->0 (Mon), 1->6 (Sun)
      callsByDay[adjustedIndex] = stat.totalCalls;
      minutesByDay[adjustedIndex] = stat.totalMinutes || 0; // Handle null/undefined minutes
      overallTotalCalls += stat.totalCalls;
      overallTotalMinutes += stat.totalMinutes || 0;
    });

    // Round minutes to 2 decimal places
    const roundedMinutesByDay = minutesByDay.map(
      (min) => Math.round(min * 100) / 100
    );
    const roundedTotalMinutes = Math.round(overallTotalMinutes * 100) / 100;

    res.status(200).json({
      message: "Call stats retrieved successfully",
      stats: {
        totalCalls: overallTotalCalls,
        totalMinutes: roundedTotalMinutes,
        callsByDay, // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
        minutesByDay: roundedMinutesByDay, // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
      },
    });
  } catch (error) {
    console.error("Error fetching call stats:", error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
};
module.exports = {
  handleCallWebhook: exports.handleCallWebhook,
  createCall: exports.createCall,
  getCallLogs: exports.getCallLogs,
  getCallById: exports.getCallById,
  getCallStats: exports.getCallStats,
};
