const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
   
    username:{ type:String, required:true, unique:true},
    password:{ type:String, required:true},
    // Keep legacy roles ("user", "manager") to avoid breaking existing DB rows.
    // "customer" is the new preferred end-user role.
    role:{type:String , required:true,enum:["admin","employee","customer","user","manager"],},
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      default: null,
      index: true
    },

    // Contact fields for profile and OTP-based password reset.
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    
    // Profile fields
    profileImage: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: String,
      default: null,
    },
    
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  }, 
  {  timestamps: true,}
);


module.exports = mongoose.model("User", userschema);