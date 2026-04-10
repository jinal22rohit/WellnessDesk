const express = require("express");
const router = express.Router();
const verify = require("../middlewares/authmiddleware");
const { requireRole } = require("../middlewares/authmiddleware");
const {createTherapy,getTherapies,updatetherapy,deletetherapy,parameters_Therapies} = require ("../controllers/therapycontrollers");
const uploadfile  = require("../middlewares/multer");
//admin access only

router.post("/", verify, requireRole("admin"), uploadfile.single("therapyImage"), createTherapy);
router.put("/:id", verify, requireRole("admin"), uploadfile.single("therapyImage"), updatetherapy);
router.delete("/:id", verify, requireRole("admin"), deletetherapy);

// anyone can view 
router.get("/",getTherapies);

// customer can view therapy using various parameters search , search, filter
router.get("/Therapy_param",parameters_Therapies);


module.exports = router;

