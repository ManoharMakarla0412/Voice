const express = require("express");
const mongoose = require("mongoose");
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

const app = express();
const port = process.env.PORT || 5003;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://your-app.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

connectDB();
scheduleBillingEmails();
console.log("Billing email scheduler started");

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
