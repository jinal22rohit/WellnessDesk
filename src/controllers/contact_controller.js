const mongoose = require('mongoose');
const contact = require("../models/contactmodel");


exports.createcontact = async (req, res) => {
  try {

    const { name, email, subject, message } = req.body;

    const contactPost = await contact.create({
      name,
      email,
      subject,
      message
    });

    res.json({
      success: 1,
      message: "Contact submitted successfully",
      data: contactPost
    });

  } catch (error) {
    res.json({
      success: 0,
      message: "Error in code",
      error: error.message
    });
  }
};


exports.getContact = async (req, res) => {
  try {
    const contactData = await contact.find();

    res.json({
      success: 1,
      message: "All Contact Details",
      data: contactData
    });

  } catch (error) {
    res.json({
      success: 0,
      message: "Error in code"
    });
  }
};