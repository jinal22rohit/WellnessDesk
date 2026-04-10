
const user = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Employee = require("../models/employee_model");

const register = async (req,res) =>{
    try{ 
    let { username, password, role, email, phoneNumber } = req.body;

    // Public registration should only create customers.
    // Also map legacy "user" to the new "customer" role.
    if (!role || role === "user") role = "customer";
    if (role !== "customer") {
        return res.status(403).json({ message: "Only customers can self-register" });
    }
    email = String(email || "").toLowerCase().trim();
    phoneNumber = String(phoneNumber || "").trim();
    if (!email || !phoneNumber) {
        return res.status(400).json({ message: "email and phoneNumber are required" });
    }

    const hashedpassword  = await bcrypt.hash(password,10);

    const newuser = new user ({ username,name:username,password:hashedpassword,role,email,phoneNumber});
    await newuser.save();
    res.status(201).json({message:`user register with username  ${username}`}) }
   catch(err){
    console.error("REGISTER ERROR:", err.message);
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(400).json({ 
      message: `This ${field} is already registered. Please use a different ${field}.`
    });
  }
  res.status(500).json({ message: "Something went wrong. Please try again." });
}
};


const login =  async (req,res) =>{
    try{ 
const { username, password, role } = req.body;

// Role selected on login page:
// - "emp" -> "employee"
// - "user" -> "customer"
// - "admin" -> "admin"
const selectedRole =
  role === "emp" ? "employee"
  : role === "user" ? "customer"
  : role;

if (!selectedRole) {
    return res.status(400).json({ message: "Role is required" });
}

const identifier = typeof username === "string" ? username.trim() : "";
let existingUser = null;

// Employee login can use email OR username.
if (selectedRole === "employee" && identifier.includes("@")) {
  const employee = await Employee.findOne({ email: identifier.toLowerCase() });
  if (!employee) return res.status(400).json({ message: "user not found" });
  existingUser = await user.findOne({ employeeId: employee._id, role: "employee" });
} else {
  existingUser = await user.findOne({ username: identifier });
}

if(!existingUser){ return res.status(400).json({message:"user not found"}); }
  
const ismatch = await bcrypt.compare(password,existingUser.password);
if(!ismatch){
     return res.status(400).json({
                message: "Invalid credentials"
            });
}

const normalizedRole = existingUser.role === "user" ? "customer" : existingUser.role;
if (selectedRole !== normalizedRole) {
    return res.status(403).json({ message: `This account is not a ${selectedRole}` });
}
const token = jwt.sign({id:existingUser._id,role:normalizedRole },process.env.JWT_SECRET,
{expiresIn : "1d"} );
res.status(200).json({token, role: normalizedRole})   }
catch(err){
  console.error("LOGIN ERROR:", err.message);
  res.status(500).json({ message: "Something went wrong. Please try again." });
}


};


module.exports = {
    register,
    login
}