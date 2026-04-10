const mongoose = require("mongoose");


const User = require("./usermodel");

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  therapyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "therapy",
  },
  empName: {
    type: String,
    required: true,
  },
  empImg: {
    type: String,
  },
  dob: {
    type: String,
  },
  createdAt: {      
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("employee", employeeSchema);