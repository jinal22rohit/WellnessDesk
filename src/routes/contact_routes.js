const { createcontact, getContact} = require ("../controllers/contact_controller");
const express = require("express");
const router = express.Router();
const verify = require("../middlewares/authmiddleware");
const { requireRole } = require("../middlewares/authmiddleware");


router.post("/addcontact",createcontact);
router.get("/getallcontact", verify, requireRole("admin"), getContact);
module.exports = router;