const moment = require("moment");
const Appointment = require("../models/appointmentModel");

exports.createAppointment = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log VAPI data
    const { message } = req.body;
    const userId = req.user?.id || "default-user"; // Fallback if middleware fails
    console.log("User ID:", userId);

    if (!message) return res.status(400).json({ error: "No message" });
    if (message.type !== "tool-calls") return res.status(400).json({ error: "Invalid type" });
    if (!message.toolCalls?.length) return res.status(400).json({ error: "No tool calls" });

    const toolCall = message.toolCalls[0];
    if (toolCall.function.name !== "Function_Tool") return res.status(400).json({ error: "Wrong function" });

    const args = toolCall.function.arguments;
    console.log("Args:", args);
    if (!args.dateandtime || typeof args.dateandtime !== "string") return res.status(400).json({ error: "Bad dateandtime" });

    const messages = message.artifact?.messages;
    if (!messages?.length) return res.status(400).json({ error: "No artifact messages" });

    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    if (!startTime || !endTime) return res.status(400).json({ error: "Bad timestamps" });

    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);

    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes("tomorrow")) {
      const timePartRaw = args.dateandtime.split("tomorrow")[1];
      const timePart = timePartRaw?.trim() || "11 AM";
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

    if (!appointmentDateTime.isValid()) return res.status(400).json({ error: "Invalid date" });

    const appointmentData = {
      userId, // Add userId here
      fullName: args.customername || "Unknown",
      problem: args.typeofservice || "Not specified",
      appointmentDateTime: appointmentDateTime.toDate(),
      duration: durationMinutes,
      callId: message.call?.id || "unknown", // Fallback to match old behavior
      assistantId: message.assistant?.id || "unknown",
      timestamp: new Date(message.timestamp),
      status: "scheduled",
    };

    console.log("Data to save:", appointmentData);
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log("Saved:", savedAppointment);

    res.status(200).json({ message: "Booked", appointment: appointmentData });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed", details: error.message });
  }
};

exports.getLatestAppointments = async (req, res) => {
  try {
    const userId = req.user?.id || "default-user";
    console.log("Fetching for userId:", userId);
    const appointments = await Appointment.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);
    console.log("Fetched:", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch", details: error.message });
  }
};