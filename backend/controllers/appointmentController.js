const moment = require("moment");
const Appointment = require("../models/appointmentModel");


exports.createAppointment = async (req, res) => {
  try {
    console.log("Request received at /api/appointments/book"); // Confirm endpoint hit
    console.log("Request body:", req.body); // Must show VAPI data
    const { message } = req.body;
    const userId = req.user.id;
    console.log("User ID:", userId); // Should be 67e17813bb2f5277647a0850

    if (!message) return res.status(400).json({ error: "No message provided" });
    console.log("Message:", message);

    if (message.type !== "tool-calls") return res.status(400).json({ error: "Invalid message type" });
    if (!message.toolCalls?.length) return res.status(400).json({ error: "No tool calls found" });

    const toolCall = message.toolCalls[0];
    console.log("Tool call:", toolCall);
    if (toolCall.function.name !== "Function_Tool") return res.status(400).json({ error: "Unexpected tool call function" });

    const args = toolCall.function.arguments;
    console.log("Args:", args);
    if (!args.dateandtime || typeof args.dateandtime !== "string") return res.status(400).json({ error: "Missing or invalid dateandtime" });

    const messages = message.artifact?.messages;
    if (!messages?.length) return res.status(400).json({ error: "No messages in artifact" });
    console.log("Artifact messages:", messages);

    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    if (!startTime || !endTime) return res.status(400).json({ error: "Invalid message timestamps" });
    console.log("Start time:", startTime, "End time:", endTime);

    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);
    console.log("Duration (minutes):", durationMinutes);

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

    if (!appointmentDateTime.isValid()) return res.status(400).json({ error: "Invalid dateandtime format" });
    console.log("Appointment date/time:", appointmentDateTime.toDate());

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
    console.log("Data to save:", appointmentData);

    if (!appointmentData.callId) return res.status(400).json({ error: "Missing call ID" });

    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log("Appointment saved:", savedAppointment);

    res.status(200).json({
      message: "Appointment booked successfully",
      appointment: appointmentData,
    });
  } catch (error) {
    console.error("Error in createAppointment:", error.message);
    res.status(500).json({
      error: "Failed to process appointment",
      details: error.message,
    });
  }
};



exports.getLatestAppointments = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    console.log("Fetching for userId:", userId);
    const appointments = await Appointment.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);
    console.log("Fetched:", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch appointments", details: error.message });
  }
};