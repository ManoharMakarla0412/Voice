const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const assistantRoutes = require("./routes/assistantRoutes");
const twilioRoutes = require("./routes/twilioRoute");
const knowledgebaseRoute = require('./routes/knowledgebaseRoute'); // Import routes
const callRoutes = require('./routes/callRoutes');
const logsRoute = require('./routes/logsRoute');
const calendlyRoutes = require('./routes/tokenRoutes');
const connectDB = require("./config/db"); // MongoDB connection
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Import path module

const app = express();
const port = 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: ["http://localhost:3000", "https://voice-seven-mocha.vercel.app"], // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow cookies and other credentials
  })
);

// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use user, assistant, twilio, and knowledge base routes
app.use("/user", userRoutes);
app.use("/assistant", assistantRoutes);
app.use("/twilio", twilioRoutes);
app.use('/api', knowledgebaseRoute);
app.use('/api/calls', callRoutes);
app.use('/api', logsRoute)
app.use('/api/auth', calendlyRoutes);

// Connect to MongoDB
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});