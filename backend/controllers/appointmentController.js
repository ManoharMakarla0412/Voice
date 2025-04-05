const moment = require("moment");
const Appointment = require("../models/appointmentModel");

exports.createAppointment = async (req, res) => {
  console.log("Received Request:", JSON.stringify(req.body, null, 2));

  try {
    const { message } = req.body;
    if (!message) {
      console.log("No message in request body");
      return res.status(400).json({ error: "No message provided" });
    }
    if (message.type !== "tool-calls") {
      console.log("Invalid message type:", message.type);
      return res.status(400).json({ error: "Invalid message type" });
    }
    if (!message.toolCalls || !message.toolCalls.length) {
      console.log("No toolCalls in message");
      return res.status(400).json({ error: "No tool calls found" });
    }

    const toolCall = message.toolCalls[0];
    console.log("Tool Call:", JSON.stringify(toolCall, null, 2));

    if (toolCall.function.name !== "Function_Tool") {
      console.log("Unexpected function name:", toolCall.function.name);
      return res.status(400).json({ error: "Unexpected tool call function" });
    }

    const args = toolCall.function.arguments;
    console.log("Arguments:", JSON.stringify(args, null, 2));

    if (!args.dateandtime || typeof args.dateandtime !== "string") {
      console.log("Invalid dateandtime:", args.dateandtime);
      return res.status(400).json({ error: "Missing or invalid dateandtime" });
    }

    const messages = message.artifact?.messages;
    if (!messages || !messages.length) {
      console.log("No messages in artifact");
      return res.status(400).json({ error: "No messages in artifact" });
    }

    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    if (!startTime || !endTime) {
      console.log("Invalid startTime or endTime:", { startTime, endTime });
      return res.status(400).json({ error: "Invalid message timestamps" });
    }

    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);
    console.log("Duration (minutes):", durationMinutes);

    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes("tomorrow")) {
      const timePartRaw = args.dateandtime.split("tomorrow")[1];
      const timePart = timePartRaw && timePartRaw.trim() ? timePartRaw.trim() : "11 AM";
      console.log("Parsing tomorrow time:", timePart);
      appointmentDateTime = moment(today)
        .add(1, "day")
        .set({
          hour: timePart.includes("PM") ? parseInt(timePart) + 12 : parseInt(timePart),
          minute: 0,
          second: 0,
          millisecond: 0,
        });
    } else {
      appointmentDateTime = moment(args.dateandtime, "YYYY-MM-DD HH:mm");
    }

    if (!appointmentDateTime.isValid()) {
      console.log("Invalid parsed dateandtime:", args.dateandtime);
      return res.status(400).json({ error: "Invalid dateandtime format" });
    }
    console.log("Appointment DateTime:", appointmentDateTime.toDate());

    const appointmentData = {
      fullName: args.customername || "Unknown",
      problem: args.typeofservice || "Not specified",
      appointmentDateTime: appointmentDateTime.toDate(),
      duration: durationMinutes,
      callId: message.call?.id,
      assistantId: message.assistant?.id,
      timestamp: new Date(message.timestamp),
      status: "scheduled",
    };
    console.log("Appointment Data:", appointmentData);

    // Validate required fields
    if (!appointmentData.callId) {
      console.log("Missing callId");
      return res.status(400).json({ error: "Missing call ID" });
    }

    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log("Saved Appointment:", JSON.stringify(savedAppointment, null, 2));

    // Emit event via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("appointmentCreated", appointmentData);
      console.log("Socket.IO event emitted: appointmentCreated");
    } else {
      console.log("Socket.IO instance not found on req.app");
    }

    res.status(200).json({
      message: "Appointment booked successfully",
      appointment: appointmentData,
    });
  } catch (error) {
    console.error("Error processing appointment:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to process appointment",
      details: error.message,
    });
  }
};