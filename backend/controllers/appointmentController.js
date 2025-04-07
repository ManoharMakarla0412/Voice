const moment = require("moment");
const Appointment = require("../models/appointmentModel");

exports.createAppointment = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });
    if (message.type !== "tool-calls") return res.status(400).json({ error: "Invalid message type" });
    if (!message.toolCalls || !message.toolCalls.length) return res.status(400).json({ error: "No tool calls found" });

    const toolCall = message.toolCalls[0];
    if (toolCall.function.name !== "Function_Tool") return res.status(400).json({ error: "Unexpected tool call function" });

    const args = toolCall.function.arguments;
    if (!args.dateandtime || typeof args.dateandtime !== "string") return res.status(400).json({ error: "Missing or invalid dateandtime" });

    const messages = message.artifact?.messages;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages in artifact" });

    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    if (!startTime || !endTime) return res.status(400).json({ error: "Invalid message timestamps" });

    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);

    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes("tomorrow")) {
      const timePartRaw = args.dateandtime.split("tomorrow")[1];
      const timePart = timePartRaw && timePartRaw.trim() ? timePartRaw.trim() : "11 AM";
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

    if (!appointmentDateTime.isValid()) return res.status(400).json({ error: "Invalid dateandtime format" });

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

    if (!appointmentData.callId) return res.status(400).json({ error: "Missing call ID" });

    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
console.log("Appointment saved:", savedAppointment);

    res.status(200).json({
      message: "Appointment booked successfully",
      appointment: appointmentData,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process appointment",
      details: error.message,
    });
  }
};

exports.getLatestAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ timestamp: -1 }) // Latest first
      .limit(10); // Limit to recent ones for demo
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments", details: error.message });
  }
};