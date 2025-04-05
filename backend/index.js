const express = require("express");
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
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { swaggerUi, swaggerSpecs } = require("./swagger/swagger");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 5003;

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://app.elidepro.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Pass io to routes that need it (e.g., appointmentRoutes)
app.set("io", io);

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5003", "https://app.elidepro.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/user", userRoutes);
app.use("/assistant", assistantRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/twilio", twilioRoutes);
app.use("/api", knowledgebaseRoute);
app.use("/api/calls", callRoutes);
app.use("/api", logsRoute);
app.use("/api/auth", calendlyRoutes);
app.use("/api/phone", phonenumberRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/events", eventRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

// Connect to MongoDB
connectDB();

// Start cron scheduler
scheduleBillingEmails();
console.log("Billing email scheduler started");

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});

module.exports = { app, io }; // Export io for use in controllers if needed