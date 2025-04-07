const moment = require("moment");
const Appointment = require("../models/appointmentModel");

exports.createAppointment = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log incoming request
    const { message } = req.body;
    const userId = req.user.id; // From JWT middleware
    console.log("User ID from token:", userId); // Verify userId

    if (!message) return res.status(400).json({ error: "No message provided" });
    if (message.type !== "tool-calls") return res.status(400).json({ error: "Invalid message type" });
    if (!message.toolCalls || !message.toolCalls.length) return res.status(400).json({ error: "No tool calls found" });

    const toolCall = message.toolCalls[0];
    if (toolCall.function.name !== "Function_Tool") return res.status(400).json({ error: "Unexpected tool call function" });

    const args = toolCall.function.arguments;
    console.log("Arguments:", args); // Log arguments
    if (!args.dateandtime || typeof args.dateandtime !== "string") return res.status(400).json({ error: "Missing or invalid dateandtime" });

    const messages = message.artifact?.messages;
    if (!messages || !messages.length) return res.status(400).json({ error: "No messages in artifact" });

    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    if (!startTime || !endTime) return res.status(400).json({ error: "Invalid message timestamps" });

    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);
    console.log("Calculated duration (minutes):", durationMinutes); // Log duration

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

    if (!appointmentDateTime.isValid()) {
      console.log("Invalid dateand FASTtime:", args.dateandtime); // Log invalid date
      return res.status(400).json({ error: "Invalid dateandtime format" });
    }
    console.log("Parsed appointmentDateTime:", appointmentDateTime.toDate()); // Log parsed date

    const appointmentData = {
      userId,
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

    console.log("Appointment data before save:", appointmentData); // Log data before saving
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log("Appointment saved:", savedAppointment); // Should log if saved

    res.status(200).json({
      message: "Appointment booked successfully",
      appointment: appointmentData,
    });
  } catch (error) {
    console.error("Error in createAppointment:", error); // Log full error details
    res.status(500).json({
      error: "Failed to process appointment",
      details: error.message,
    });
  }
};

exports.getLatestAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching appointments for userId:", userId); // Log userId
    const appointments = await Appointment.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);
    console.log("Fetched appointments:", appointments); // Log fetched data
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error in getLatestAppointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments", details: error.message });
  }
};