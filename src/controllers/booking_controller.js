const Booking = require("../models/bookingmodel");
const generateSlots = require("../utils/generate_slots")

const Therapy = require("../models/therapymodel");
const User = require("../models/usermodel");


// Create a booking
exports.booking = async (req, res) => {
  try {

    const { empID, therapyId, date, time } = req.body;
    const userID = req.user?.id;

    if (!userID || !empID || !therapyId || !date || !time) {
      return res.json({
        success: 0,
        message: "Missing booking fields"
      });
    }

    const existingBooking = await Booking.findOne({
      empID,
      date: new Date(date),
      time,
      status: { $ne: "cancelled" }
    });

    if (existingBooking) {
      return res.json({
        success: 0,
        message: "This therapist already has appointment at this time"
      });
    }

    const bookingData = await new Booking({
      userID,
      empID,
      therapyId,
      date: new Date(date),
      time,
      status: "booked"
    }).save();

    return res.json({
      success: 1,
      message: "Your Appointment is booked",
      data: bookingData
    });

  } catch (error) {

    return res.json({
      success: 0,
      message: "Error in code",
      err: error.message
    });

  }
};

// Get bookings by userID
exports.getBooking = async (req, res) => {
  try {
    const userID = req.user?.id;
    const FindUserBooking = await Booking.find({ userID })
      .populate("userID")
      .populate({
        path: "empID",
        populate: { path: "therapyId" },
      });

    if (!FindUserBooking || FindUserBooking.length === 0) {
      return res.json({ success: 0, message: "Data not found." });
    }

    return res.json({
      success: 1,
      message: "Data found.",
      data: FindUserBooking.reverse(),
    });
  } catch (error) {
    return res.json({
      success: 0,
      message: "Error in code",
      err: error.message,
    });
  }
};

// Get all bookings
exports.getAllBooking = async (req, res) => {
  try {
    const limitRaw = req.query?.limit;
    const skipRaw = req.query?.skip;
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 30, 1), 200);
    const skip = Math.max(parseInt(skipRaw, 10) || 0, 0);

    const total = await Booking.countDocuments({});

    // Keep payload small: select just what UI needs, and lean for speed.
    const data = await Booking.find({})
      .sort({ date: -1, time: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "userID", select: "username role" })
      .populate({ path: "therapyId", select: "therapyName duration therapyprice category" })
      .populate({ path: "empID", select: "empName email therapyId" })
      .lean();

    return res.json({
      success: 1,
      message: "Data Found",
      data,
      meta: {
        total,
        limit,
        skip,
        hasMore: skip + data.length < total,
      },
    });
  } catch (error) {
    return res.json({
      success: 0,
      message: "Error in code",
      err: error.message,
    });
  }
};




exports.getSlots = async (req,res)=>{

 try{

   const {therapyId, empID, date} = req.body

   const therapy = await Therapy.findById(therapyId)

   if(!therapy){
     return res.json({
       success:0,
       message:"Therapy not found"
     })
   }

   const selectedDuration = Number(therapy.duration)
   if (!selectedDuration || selectedDuration <= 0) {
     return res.status(400).json({
       success: 0,
       message: "Invalid therapy duration. Please fix therapy duration in database/admin.",
     })
   }

   const slots = generateSlots(selectedDuration)

   const start = new Date(date)
   start.setHours(0,0,0,0)

   const end = new Date(date)
   end.setHours(23,59,59,999)

   const bookingFilter = {
     date:{ $gte:start, $lte:end },
     status: { $ne: "cancelled" }
   }

   // Slot availability should be employee-specific when empID is provided.
   if (empID) bookingFilter.empID = empID
   else bookingFilter.therapyId = therapyId

   // We need therapy duration of existing bookings to detect overlaps.
   const bookings = await Booking.find(bookingFilter).populate("therapyId")

   const toMinutes = (hhmm) => {
     if (!hhmm || typeof hhmm !== "string") return null
     const [h, m] = hhmm.split(":").map((x) => Number(x))
     if (Number.isNaN(h) || Number.isNaN(m)) return null
     return h * 60 + m
   }

   // Build booked intervals in minutes: [start, end)
   const bookedIntervals = bookings
     .map((b) => {
       const startMin = toMinutes(b.time)
       const dur = Number(b?.therapyId?.duration)
       if (startMin == null || !dur) return null
       return { start: startMin, end: startMin + dur }
     })
     .filter(Boolean)

   // A candidate slot is unavailable if it overlaps any booked interval:
   // overlap exists when slotStart < bookedEnd && slotEnd > bookedStart

const now = new Date()
const today = new Date()
today.setHours(0,0,0,0)

const selectedDate = new Date(date)
selectedDate.setHours(0,0,0,0)

const currentMinutes = now.getHours()*60 + now.getMinutes()

const result = slots.map((slot) => {

  const slotStart = toMinutes(slot)
  const slotEnd = slotStart + selectedDuration

  const overlaps = bookedIntervals.some((b) => slotStart < b.end && slotEnd > b.start)

  // ❗ prevent past slots if booking for today
  const isPastSlot =
  selectedDate.getTime() === today.getTime() &&
  slotEnd <= currentMinutes

  return {
    time: slot,
    available: !overlaps && !isPastSlot
  }

})

   return res.json({
     success:1,
     slots:result
   })

 }
 catch(error){

   return res.json({
     success:0,
     message:"Error",
     err:error.message
   })

 }

}

// ===== New REST-style APIs (as requested) =====

// POST /booking (alias: existing booking)
exports.createBooking = exports.booking;

// GET /booking/user/:userID
exports.getBookingsByUser = async (req, res) => {
   console.log("req.user:", req.user);
  try {
    const { userID } = req.params;
    const requesterId = String(req.user?.id || "");
    const requesterRole = req.user?.role;
    if (!requesterId) return res.status(401).json({ success: 0, message: "Unauthorized" });
    if (requesterRole !== "admin" && requesterId !== String(userID)) {
      return res.status(403).json({ success: 0, message: "Forbidden" });
    }

    const data = await Booking.find({ userID })
      .populate("userID")
      .populate("therapyId")
      .populate("empID");

    return res.json({ success: 1, data: data.reverse() });
  } catch (error) {
    return res.json({ success: 0, message: "Error", err: error.message });
  }
};

// GET /booking/employee/:empID?range=today|upcoming|all
exports.getBookingsByEmployee = async (req, res) => {
  try {

    const loggedInUserId = req.user?.id;   // ⭐ FIXED
    if (!loggedInUserId) {
      return res.status(401).json({ success: 0, message: "Unauthorized" });
    }

    const u = await User.findById(loggedInUserId);

    if (!u || !u.employeeId) {
      return res.status(400).json({
        success: 0,
        message: "Employee account not linked"
      });
    }

    const { empID } = req.params;

    const requestedEmpId = empID ? String(empID) : null;
    const effectiveEmpId = String(u.employeeId);

    if (requestedEmpId && requestedEmpId !== effectiveEmpId) {
      return res.status(403).json({
        success: 0,
        message: "Forbidden"
      });
    }

    const range = (req.query.range || "today").toLowerCase();

    const filter = { empID: u.employeeId };

    const now = new Date();

    if (range === "today") {

      const start = new Date(now);
      start.setHours(0,0,0,0);

      const end = new Date(now);
      end.setHours(23,59,59,999);

      filter.date = { $gte: start, $lte: end };

    }

    else if (range === "upcoming") {

      const start = new Date(now);
      start.setHours(0,0,0,0);

      filter.date = { $gte: start };

    }

    const data = await Booking.find(filter)
      .populate("therapyId")
      .populate("empID")
      .populate("userID")
      .sort({ date: 1, time: 1 });   // ⭐ better sorting

    return res.json({
      success: 1,
      data
    });

  } catch (error) {

    return res.json({
      success: 0,
      message: "Error",
      err: error.message
    });

  }
};



// GET /booking/employee/me/appointments
exports.getBookingsForLoggedInEmployee = async (req, res) => {
  try {

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: 0,
        message: "Unauthorized"
      });
    }

    const u = await User.findById(userId);

    if (!u) {
      return res.status(401).json({
        success: 0,
        message: "Unauthorized"
      });
    }

    if (!u.employeeId) {
      return res.status(400).json({
        success: 0,
        message: "Employee account not linked"
      });
    }

    const data = await Booking.find({ empID: u.employeeId })
      .populate("therapyId")
      .populate("empID")
      .populate("userID")
      .sort({ date: 1, time: 1 });

    return res.json({
      success: 1,
      data
    });

  } catch (error) {

    return res.json({
      success: 0,
      message: "Error",
      err: error.message
    });

  }
};

// GET /booking/all
exports.getAllBookingsAdmin = async (req, res) => {
  return exports.getAllBooking(req, res);
};

// PUT /booking/cancel/:id
exports.cancelBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    return res.json({ success: 1, message: "Booking cancelled", data: updated });
  } catch (error) {
    return res.json({ success: 0, message: "Error", err: error.message });
  }
};

// PUT /booking/complete/:id
exports.completeBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    return res.json({ success: 1, message: "Booking completed", data: updated });
  } catch (error) {
    return res.json({ success: 0, message: "Error", err: error.message });
  }
};

// GET /booking/user/:userID/completed (therapy history + book again source)
exports.getCompletedByUser = async (req, res) => {
  try {
    const { userID } = req.params;
    const data = await Booking.find({ userID, status: "completed" })
      .populate("therapyId")
      .populate("empID")
      .populate("userID");

    return res.json({ success: 1, data: data.reverse() });
  } catch (error) {
    return res.json({ success: 0, message: "Error", err: error.message });
  }
};