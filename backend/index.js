const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoute");
const assistantRoutes = require("./routes/assistantRoutes");
const twilioRoutes = require("./routes/twilioRoute");
const knowledgebaseRoute = require("./routes/knowledgebaseRoute");
const callRoutes = require("./routes/callRoutes");
const logsRoute = require("./routes/logsRoute");
const calendlyRoutes = require("./routes/tokenRoutes");
const phonenumberRoutes = require("./routes/phoneNumberRoute");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/phonepeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const planRoutes = require("./routes/planRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const { scheduleBillingEmails } = require("./utils/billingEmailScheduler");
const connectDB = require("./config/db");
const { swaggerUi, swaggerSpecs } = require("./swagger/swagger");
const { getAssistantFromVapi, getCallsFromVapi } = require("./utils/apiClient");
const Assistant = require("./models/assistantModel");
const CallLog = require("./models/calllogsModel");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://app.elidepro.com",
      "http://localhost:5003",
      "https://mighty-driven-dragon.ngrok-free.app",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  path: "/v1/voice/socket.io",
});
app.set("socketio", io);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://app.elidepro.com",
      "http://localhost:5003",
      "https://mighty-driven-dragon.ngrok-free.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/calls/webhook", (req, res, next) => {
  console.log("Webhook received:", {
    method: req.method,
    path: req.path,
    body: req.body,
  });
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/user", userRoutes);
app.use("/assistant", assistantRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/twilio", twilioRoutes);
app.use("/api", knowledgebaseRoute);
app.use("/api/calls", callRoutes);
app.use("/api", logsRoute);
app.use("/api/auth", calendlyRoutes);
app.use("/api/phone", phonenumberRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/events", eventRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, { explorer: true })
);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Sync VAPI data on startup with default user ID
const DEFAULT_USER_ID = "67e17813bb2f5277647a0850";

const syncVapiData = async () => {
  try {
    console.log("Syncing VAPI data...");

    // Sync Assistants
    const assistants = await getAssistantFromVapi();
    for (const vapiAssistant of assistants) {
      const existingAssistant = await Assistant.findOne({
        vapiAssistantId: vapiAssistant.id,
      });
      if (!existingAssistant) {
        const newAssistant = new Assistant({
          userId: DEFAULT_USER_ID,
          vapiAssistantId: vapiAssistant.id,
          name: vapiAssistant.name,
          firstMessage: vapiAssistant.firstMessage,
          voicemailMessage: vapiAssistant.voicemailMessage,
          endCallMessage: vapiAssistant.endCallMessage,
          recordingEnabled: vapiAssistant.recordingEnabled || false,
          voice: vapiAssistant.voice,
          model: vapiAssistant.model,
          updatedAt: new Date(),
        });
        await newAssistant.save();
        console.log(
          `Added new assistant: ${vapiAssistant.id} for user ${DEFAULT_USER_ID}`
        );
      } else if (
        new Date(existingAssistant.updatedAt) <
        new Date(vapiAssistant.updatedAt || vapiAssistant.createdAt)
      ) {
        existingAssistant.name = vapiAssistant.name;
        existingAssistant.firstMessage = vapiAssistant.firstMessage;
        existingAssistant.voicemailMessage = vapiAssistant.voicemailMessage;
        existingAssistant.endCallMessage = vapiAssistant.endCallMessage;
        existingAssistant.recordingEnabled = vapiAssistant.recordingEnabled;
        existingAssistant.voice = vapiAssistant.voice;
        existingAssistant.model = vapiAssistant.model;
        existingAssistant.updatedAt = new Date();
        await existingAssistant.save();
        console.log(`Updated assistant: ${vapiAssistant.id}`);
      }
    }

    // Sync Calls
    const calls = await getCallsFromVapi();
    for (const vapiCall of calls) {
      const existingCall = await CallLog.findOne({ callId: vapiCall.id });
      if (!existingCall) {
        const newCallLog = new CallLog({
          callId: vapiCall.id,
          orgId: vapiCall.orgId,
          type: vapiCall.type,
          startedAt: vapiCall.startedAt ? new Date(vapiCall.startedAt) : null,
          endedAt: vapiCall.endedAt ? new Date(vapiCall.endedAt) : null,
          minutes:
            vapiCall.costs?.find((c) => c.type === "transcriber")?.minutes || 0,
          cost: vapiCall.cost || 0,
          status: vapiCall.status || "completed",
          customerNumber: vapiCall.customer?.number || null,
          assistantId: vapiCall.assistantId || null, // Handle missing assistantId
          assistant: vapiCall.assistant
            ? {
                name: vapiCall.assistant.name,
                firstMessage: vapiCall.assistant.firstMessage,
                voiceProvider: vapiCall.assistant.voice?.provider,
                voiceId: vapiCall.assistant.voice?.voiceId,
              }
            : {},
          updatedAt: new Date(),
        });
        await newCallLog.save();
        console.log(`Added new call: ${vapiCall.id}`);
      } else if (
        new Date(existingCall.updatedAt) <
        new Date(vapiCall.updatedAt || vapiCall.createdAt)
      ) {
        existingCall.startedAt = vapiCall.startedAt
          ? new Date(vapiCall.startedAt)
          : existingCall.startedAt;
        existingCall.endedAt = vapiCall.endedAt
          ? new Date(vapiCall.endedAt)
          : existingCall.endedAt;
        existingCall.minutes =
          vapiCall.costs?.find((c) => c.type === "transport")?.minutes ||
          existingCall.minutes;
        existingCall.cost = vapiCall.cost || existingCall.cost;
        existingCall.status = vapiCall.status || existingCall.status;
        existingCall.assistantId =
          vapiCall.assistantId || existingCall.assistantId;
        existingCall.assistant = vapiCall.assistant
          ? {
              name: vapiCall.assistant.name,
              firstMessage: vapiCall.assistant.firstMessage,
              voiceProvider: vapiCall.assistant.voice?.provider,
              voiceId: vapiCall.assistant.voice?.voiceId,
            }
          : existingCall.assistant;
        existingCall.updatedAt = new Date();
        await existingCall.save();
        console.log(`Updated call: ${vapiCall.id}`);
      }
    }

    console.log("VAPI data sync completed");
  } catch (error) {
    console.error("Error syncing VAPI data:", error);
  }
};

// Connect to MongoDB and sync data
connectDB()
  .then(async () => {
    await syncVapiData();
    scheduleBillingEmails();
    console.log("Billing email scheduler started");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  shutdown();
});
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

const port = process.env.PORT || 5003;
server
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
    console.log(
      `Socket.IO available at http://localhost:${port}/v1/voice/socket.io`
    );
  })
  .on("error", (error) => {
    console.error("Server startup error:", error);
    process.exit(1);
  });

module.exports = { app, io };
