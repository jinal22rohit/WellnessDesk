const cron = require("node-cron");
const Booking = require("../models/bookingmodel");

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Booking.updateMany(
      {
        status: "booked",
        date: { $lt: today }
      },
      { $set: { status: "completed" } }
    );

    console.log(`[CRON] Auto-completed ${result.modifiedCount} past bookings`);
  } catch (err) {
    console.error("[CRON] Error:", err.message);
  }
});