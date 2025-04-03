// const mongoose = require("mongoose");

// // Replace these paths with the actual paths to your models
// const User = require("./models/userModel");
// const Plan = require("./models/planModel");
// const Subscription = require("./models/subscriptionModel");

// // Connect to your MongoDB database
// mongoose.connect(
//   "mongodb+srv://sunnysaicharan1:MJZOFzkaSYIhCihO@adminboard.lhfrl.mongodb.net/?retryWrites=true&w=majority",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );

// // Define the user and plan IDs
// const userId = "67e17813bb2f5277647a0850";
// const planId = "67e98a6c3419e5b7656fac09";

// // Function to create subscription and update user
// async function seedSubscription() {
//   try {
//     // Step 1: Find the user
//     const user = await User.findById(userId);
//     if (!user) {
//       console.error("User not found");
//       return;
//     }

//     // Step 2: Find the plan
//     const plan = await Plan.findById(planId);
//     if (!plan) {
//       console.error("Plan not found");
//       return;
//     }

//     // Step 3: Create a new subscription document
//     const newSubscription = new Subscription({
//       userId: user._id,
//       planId: plan._id,
//       billingCycle: user.billing, // "monthly"
//       startDate: user.registrationDate, // "2025-03-24T15:19:47.510Z"
//       status: "active",
//       additionalMinutes: 0,
//       addOnPurchases: [],
//     });

//     // Save the subscription to the database
//     const savedSubscription = await newSubscription.save();
//     console.log("Subscription created:", savedSubscription);

//     // Step 4: Update the user with the subscription ID
//     user.subscriptionId = savedSubscription._id;
//     await user.save();
//     console.log("User updated with subscription ID:", user.subscriptionId);
//   } catch (error) {
//     console.error("Error during seeding:", error);
//   } finally {
//     // Disconnect from the database
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   }
// }

// // Run the seeding function
// seedSubscription();
