require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const assistantRoutes = require("./routes/assistantRoutes");
const twilioRoutes = require("./routes/twilioRoute");
const knowledgebaseRoute = require('./routes/knowledgebaseRoute');
const callRoutes = require('./routes/callRoutes');
const logsRoute = require('./routes/logsRoute');
const calendlyRoutes = require('./routes/tokenRoutes');
const phonenumberRoutes = require('./routes/phoneNumberRoute');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/phonepeRoutes');
const eventRoutes = require("./routes/eventRoutes");
const { scheduleBillingEmails } = require("./utils/billingEmailScheduler");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 5003;

// Log environment variables for debugging
console.log('Env vars loaded:', {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
  googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
});

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/user", userRoutes);
app.use("/assistant", assistantRoutes);
app.use("/twilio", twilioRoutes);
app.use('/api', knowledgebaseRoute);
app.use('/api/calls', callRoutes);
app.use('/api', logsRoute);
app.use('/api/auth', calendlyRoutes);
app.use('/api/phone', phonenumberRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/events", eventRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB
connectDB();

// Start scheduler
scheduleBillingEmails();
console.log("Billing email scheduler started");

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});