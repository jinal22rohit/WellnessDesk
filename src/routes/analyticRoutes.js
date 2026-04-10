const express = require("express");
const router = express.Router();
const verify = require("../middlewares/authmiddleware");
const { requireRole } = require("../middlewares/authmiddleware");
const { getRevenueAnalytics } = require("../controllers/analyticsControllers");

router.get("/revenue", verify, requireRole("admin"), getRevenueAnalytics);

module.exports = router;