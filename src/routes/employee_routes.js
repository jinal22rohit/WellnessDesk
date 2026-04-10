const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  findByTherapy,
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
} = require("../controllers/employee_controller");

const express = require("express");
const router = express.Router();
const verify = require("../middlewares/authmiddleware");
const { requireRole } = require("../middlewares/authmiddleware");
const uploadfile = require("../middlewares/multer");

// Create Employee
router.post("/postEmployee", verify, requireRole("admin"), uploadfile.single("empImg"), createEmployee);

// Get All Employees
router.get("/getEmployees", getAllEmployees);

// Get Employee By ID
router.get("/getEmployee/:id", getEmployeeById);

// Update Employee
// ✅ Correct — add uploadfile middleware
router.patch("/updateEmployee/:id", verify, requireRole("admin"), uploadfile.single("empImg"), updateEmployee);

// Delete Employee
router.delete("/deleteEmployee/:id", verify, requireRole("admin"), deleteEmployee);

// Find Employee By Therapy
router.post("/findEmployeeByTherapy", findByTherapy);

// Employee self profile
router.get("/me", verify, requireRole("employee", "admin"), getMyEmployeeProfile);
router.patch("/me", verify, requireRole("employee", "admin"), uploadfile.single("empImg"), updateMyEmployeeProfile);

module.exports = router;