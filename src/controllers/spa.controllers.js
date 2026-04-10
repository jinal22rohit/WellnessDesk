const Spa = require("../models/spa_model");

// Create Spa
exports.createSpa = async (req, res) => {
  try {
    
    const newSpa = await Spa.create({...req.body, spaImg:`http://localhost:7000/uploads/${req.file.filename}`});

    res.status(201).json({
      success: true,
      message: "Spa created successfully",
      data: newSpa
  
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating spa",
      error: error.message,
    });
  }
};

// Get All Spas
exports.getAllSpas = async (req, res) => {
  try {
    const spas = await Spa.find();

    res.status(200).json({
      success: true,
      data: spas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching spas",
      error: error.message,
    });
  }
};

// Get Single Spa
exports.getSpaById = async (req, res) => {
  try {
    const spa = await Spa.findById(req.params.id);

    if (!spa) {
      return res.status(404).json({
        success: false,
        message: "Spa not found",
      });
    }

    res.status(200).json({
      success: true,
      data: spa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching spa",
      error: error.message,
    });
  }
};

// Update Spa
exports.updateSpa = async (req, res) => {
  try {
    const updatedSpa = await Spa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Spa updated successfully",
      data: updatedSpa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating spa",
      error: error.message,
    });
  }
};

// Delete Spa
exports.deleteSpa = async (req, res) => {
  try {
    await Spa.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Spa deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting spa",
      error: error.message,
    });
  }
};
