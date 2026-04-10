const express = require('express');
const user = require("../models/usermodel");
const router = express.Router();
const verify = require("../middlewares/authmiddleware");
const { requireRole } = require("../middlewares/authmiddleware");
const uploadfile = require("../middlewares/multer");

// Admin dashboard (admin only)
router.get("/admin", verify, requireRole("admin"), (req,res)=>{
    res.json({message:"welcome Admin", role: req.user.role});
});

// Employee dashboard (employee only)
router.get("/employee", verify, requireRole("employee"), (req,res)=>{
    res.json({message:"welcome employee", role: req.user.role});
});
  
// Customer dashboard (customer only)
router.get("/customer", verify, requireRole("customer"), (req,res)=>{
    res.json({message:"welcome customer", role: req.user.role});
});

// Backward-compatible aliases (if frontend uses older route names)
router.get("/user", verify, requireRole("customer"), (req,res)=>{
    res.json({message:"welcome customer", role: req.user.role});
});
router.get("/emp", verify, requireRole("employee"), (req,res)=>{
    res.json({message:"welcome employee", role: req.user.role});
});


const {searchuser, getUserByEmployeeId, getUserById, getMyProfile, updateMyProfile} = require("../controllers/Usercontrollers");

router.get("/search", searchuser);
router.get("/by-employee/:employeeId", verify, getUserByEmployeeId);
router.get("/me", verify, getMyProfile);                                    // ← move UP
router.patch("/me", verify, uploadfile.single("profileImage"), updateMyProfile); // ← move UP
router.get("/:id", verify, getUserById);                                    // ← stays last

module.exports = router ; 