const {createSpa, getAllSpas,getSpaById,updateSpa,deleteSpa} = require("../controllers/spa.controllers");
const express = require("express");
const router = express.Router();
const uploadfile = require("../middlewares/multer");


router.post("/spaPost",uploadfile.single("spaImg"),createSpa);
router.get("/getSpa",getAllSpas);
router.get("/getSpa/:id",getSpaById);
router.patch("/updateSpa/:id",updateSpa);
router.delete("/deleteSpa/:id", deleteSpa);

module.exports = router;
