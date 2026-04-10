const Booking = require("../models/bookingmodel");

const getRevenueAnalytics = async (req, res) => {
  try {

    // 1. Total revenue — sum price of all completed bookings
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $lookup: { from: "therapies", localField: "therapyId", foreignField: "_id", as: "therapy" } },
      { $unwind: "$therapy" },
      { $group: { _id: null, total: { $sum: "$therapy.price" } } },
    ]);

    // 2. Revenue by therapy
    const revenueByTherapy = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $lookup: { from: "therapies", localField: "therapyId", foreignField: "_id", as: "therapy" } },
      { $unwind: "$therapy" },
      { $group: { _id: "$therapy.therapyName", revenue: { $sum: "$therapy.price" }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);

    // 3. Revenue by employee
    const revenueByEmployee = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $lookup: { from: "therapies", localField: "therapyId", foreignField: "_id", as: "therapy" } },
      { $unwind: "$therapy" },
      { $lookup: { from: "employees", localField: "empID", foreignField: "_id", as: "employee" } },
      { $unwind: "$employee" },
      { $group: { _id: "$employee.name", revenue: { $sum: "$therapy.price" }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);

    // 4. Monthly revenue
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $lookup: { from: "therapies", localField: "therapyId", foreignField: "_id", as: "therapy" } },
      { $unwind: "$therapy" },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          revenue: { $sum: "$therapy.price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 5. Booking status summary
    const statusSummary = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.json({
      success: 1,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByTherapy,
        revenueByEmployee,
        monthlyRevenue,
        statusSummary,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ success: 0, message: "Analytics failed" });
  }
};

module.exports = { getRevenueAnalytics };