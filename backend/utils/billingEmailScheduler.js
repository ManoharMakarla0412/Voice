const cron = require("node-cron");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

// Configure Nodemailer (using Gmail as an example; adjust for your email provider)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Function to calculate the next billing date
const calculateNextBillingDate = (registrationDate, billingCycleDays, lastBillingDate) => {
  let baseDate = lastBillingDate ? new Date(lastBillingDate) : new Date(registrationDate);
  baseDate.setDate(baseDate.getDate() + billingCycleDays);
  return baseDate;
};

// Function to send reminder email
const sendReminderEmail = async (user, nextBillingDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Billing Reminder: Upcoming Subscription Renewal",
    text: `Hi ${user.username},\n\nThis is a reminder that your subscription (${user.plan} plan) will renew on ${nextBillingDate.toDateString()}. The amount of ₹${
      user.plan === "monthly" ? 1999 : 19999
    } will be deducted automatically via autopay. If you wish to cancel or change your plan, please visit your account settings.\n\nThank you,\nTeam`,
    html: `
      <h3>Hi ${user.username},</h3>
      <p>This is a reminder that your subscription (${user.plan} plan) will renew on <strong>${nextBillingDate.toDateString()}</strong>.</p>
      <p>The amount of ₹${user.plan === "monthly" ? 1999 : 19999} will be deducted automatically via autopay.</p>
      <p>If you wish to cancel or change your plan, please visit your account settings.</p>
      <p>Thank you,<br>Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Function to send billing confirmation email
const sendBillingConfirmationEmail = async (user, billingDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Billing Confirmation: Subscription Renewed",
    text: `Hi ${user.username},\n\nYour subscription (${user.plan} plan) has been renewed on ${billingDate.toDateString()}. The amount of ₹${
      user.plan === "monthly" ? 1999 : 19999
    } has been deducted via autopay. Thank you for continuing with us!\n\nBest regards,\nTeam`,
    html: `
      <h3>Hi ${user.username},</h3>
      <p>Your subscription (${user.plan} plan) has been renewed on <strong>${billingDate.toDateString()}</strong>.</p>
      <p>The amount of ₹${user.plan === "monthly" ? 1999 : 19999} has been deducted via autopay.</p>
      <p>Thank you for continuing with us!</p>
      <p>Best regards,<br>Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Schedule the cron job to run daily at midnight
const scheduleBillingEmails = () => {
  cron.schedule("0 0 * * *", async () => {
    // Runs every day at 00:00 (midnight)
    try {
      console.log("Running billing email scheduler...");

      const users = await User.find();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      for (const user of users) {
        const nextBillingDate = calculateNextBillingDate(
          user.registrationDate,
          user.billingCycleDays,
          user.lastBillingDate
        );
        nextBillingDate.setHours(0, 0, 0, 0); // Normalize to start of day

        const daysUntilBilling = Math.ceil(
          (nextBillingDate - today) / (1000 * 60 * 60 * 24)
        );

        // Send reminder email 7 days before billing
        if (daysUntilBilling === 7) {
          await sendReminderEmail(user, nextBillingDate);
          console.log(`Reminder email sent to ${user.email}`);
        }

        // Send confirmation email on the billing date
        if (daysUntilBilling === 0) {
          await sendBillingConfirmationEmail(user, nextBillingDate);
          console.log(`Billing confirmation email sent to ${user.email}`);

          // Update the lastBillingDate to the current billing date
          user.lastBillingDate = nextBillingDate;
          await user.save();
        }
      }
    } catch (error) {
      console.error("Error in billing email scheduler:", error);
    }
  });
};

module.exports = { scheduleBillingEmails };