const mongoose = require("mongoose");
const Employee = require("../models/employee_model");
const User = require("../models/usermodel");
const bcrypt = require("bcryptjs");


// =============================
// CREATE EMPLOYEE + USER
// =============================
exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, phno, empName, dob, therapyId } = req.body;

  

    const hashedpassword = await bcrypt.hash(password, 10);

    // ✅ FIXED — name is required by User model
    const user = await User.create({
      username,
      name: empName,
      email: email.toLowerCase().trim(),
      password: hashedpassword,
      role: "employee",
      phoneNumber: phno
    });

    const emp = await Employee.create({
      therapyId,
      empName,
      empImg: req.file?.path ? req.file.path : undefined,
      dob,
      userId: user._id
    });

    user.employeeId = emp._id;
    await user.save();

    res.json({
      success: 1,
      message: "Employee created successfully",
      data: emp
    });

  } catch (error) {
    console.error("CREATE EMP ERROR:", error.message, error);
    res.json({
      success: 0,
      message: "Error creating employee",
      error: error.message
    });
  }
};


// =============================
// GET ALL EMPLOYEES
// =============================
exports.getAllEmployees = async (req, res) => {
  try {
    const data = await Employee.find({})
      .populate("therapyId")
      .populate("userId");

    res.json({ success: 1, data });

  } catch (error) {
    res.json({ success: 0, error: error.message });
  }
};


// =============================
// GET EMPLOYEE BY ID
// =============================
exports.getEmployeeById = async (req, res) => {
   const employee = await Employee.findById(req.params.id)
      .populate("therapyId")
      .populate("userId");

    if (!employee) return res.json({ success: 0, message: "Employee not found" });

    const user = employee.userId;

    res.json({
      success: 1,
      data: {
        ...employee.toObject(),
        username: user?.username || "",
        email: user?.email || employee.email || "",
        phoneNumber: user?.phoneNumber || employee.phno || "",
      }
    });
};


// =============================
// UPDATE EMPLOYEE + USER
// =============================
// ✅ Correct — handle image + password
exports.updateEmployee = async (req, res) => {
  try {
    const { empName, dob, therapyId, email, phoneNumber, password } = req.body;

    
  

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.json({ success: 0, message: "Employee not found" });

    // ✅ build employee patch
    const empPatch = { empName, dob, therapyId };
     if (req.file?.path) {
  empPatch.empImg = req.file.path;
}

    await Employee.findByIdAndUpdate(req.params.id, empPatch);

    // ✅ build user patch
    const userPatch = {};
    if (email) userPatch.email = email;
    if (phoneNumber) userPatch.phoneNumber = phoneNumber;
    if (password) userPatch.password = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(employee.userId, userPatch);

    const updated = await Employee.findById(req.params.id)
      .populate("therapyId")
      .populate("userId");

    res.json({ success: 1, message: "Employee updated successfully", data: updated });

} catch (error) {
  console.error("UPDATE EMP ERROR:", error.message);
  // ✅ handle duplicate key error nicely
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.json({
      success: 0,
      message: `This ${field} is already in use by another account.`
    });
  }
  res.json({ success: 0, message: error.message });
}
};

// =============================
// DELETE EMPLOYEE + USER
// =============================
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.json({ success: 0, message: "Employee not found" });
    }

    await User.findByIdAndDelete(employee.userId);
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ success: 1, message: "Employee deleted" });

  } catch (error) {
    res.json({ success: 0, error: error.message });
  }
};


// =============================
// FIND BY THERAPY
// =============================
exports.findByTherapy = async (req, res) => {
  try {
    const data = await Employee.find({ therapyId: req.body.therapyId })
      .populate("therapyId")
      .populate("userId");

    res.json({ success: 1, data });

  } catch (error) {
    res.json({ success: 0, error: error.message });
  }
};


// =============================
// EMPLOYEE SELF PROFILE
// =============================
exports.getMyEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.employeeId) {
      return res.json({ success: 0, message: "Not linked" });
    }

    const employee = await Employee.findById(user.employeeId)
      .populate("therapyId");

    res.json({
      success: 1,
      data: {
        ...employee.toObject(),
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    res.json({ success: 0, error: error.message });
  }
};


// =============================
// UPDATE SELF PROFILE
// =============================
exports.updateMyEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.employeeId) {
      return res.json({ success: 0, message: "Not linked" });
    }

    const patch = {
      empName: req.body.empName,
      dob: req.body.dob
    };
    if (req.file?.path) {
  patch.empImg = req.file.path;
}

    await Employee.findByIdAndUpdate(user.employeeId, patch, { new: true });

    const userPatch = {};
    if (req.body.email) userPatch.email = req.body.email;
    if (req.body.phno) userPatch.phoneNumber = req.body.phno;
    if (req.body.password) {
      userPatch.password = await bcrypt.hash(req.body.password, 10);
    }

    await User.findByIdAndUpdate(user._id, userPatch);

    res.json({ success: 1, message: "Profile updated" });

  } catch (error) {
    res.json({ success: 0, error: error.message });
  }
};