
const bookingController = require('../controllers/booking_controller')
const express = require('express')
const router =  express.Router()
const verify = require("../middlewares/authmiddleware");
const { requireRole } = require("../middlewares/authmiddleware");

// New REST endpoints (requested)
router.post("/", verify, requireRole("customer", "user", "admin"), bookingController.createBooking); // POST /api/booking
router.get("/user/:userID", verify, requireRole("customer","admin"), bookingController.getBookingsByUser);
router.get("/user/:userID/completed", verify, requireRole("customer", "user", "admin"), bookingController.getCompletedByUser);
router.get("/employee/:empID", verify, requireRole("employee", "admin"), bookingController.getBookingsByEmployee);
router.get("/employee/me/appointments", verify, requireRole("employee", "admin"), bookingController.getBookingsForLoggedInEmployee);
router.get("/all", verify, requireRole("admin"), bookingController.getAllBookingsAdmin);
router.put("/cancel/:id", verify, requireRole("customer", "user", "admin"), bookingController.cancelBooking);
router.put("/complete/:id", verify, requireRole("employee", "admin"), bookingController.completeBooking);
router.post("/slots", bookingController.getSlots);

// Backward-compatible endpoints
router.post('/booking' , bookingController.booking)

// router.post('/getbooking' , bookingController.getBooking)

router.get("/getbooking",verify ,bookingController.getBooking);

router.get('/getAllbooking' , bookingController.getAllBooking)

router.post("/getSlots", bookingController.getSlots)

module.exports = router;