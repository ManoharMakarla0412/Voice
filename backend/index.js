const express = require("express");
//const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const assistantRoutes = require("./routes/assistantRoutes");
const twilioRoutes = require("./routes/twilioRoute");
const knowledgebaseRoute = require("./routes/knowledgebaseRoute"); // Import routes
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
const connectDB = require("./config/db"); // MongoDB connection
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Import path module
// Import the Swagger configuration
const { swaggerUi, swaggerSpecs } = require("./swagger/swagger");

const app = express();
const port = process.env.PORT || 5003;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:5003","https://app.elidepro.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use user, assistant, twilio, and knowledge base routes
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

// Set up Swagger UI endpoint
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
  })
);

// Connect to MongoDB
connectDB();

// Start the cron scheduler
scheduleBillingEmails();
console.log("Billing email scheduler started");

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
