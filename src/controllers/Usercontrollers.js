const user = require("../models/usermodel");

const searchuser = async(req,res)=>{
    try{
        const search = req.query.search;
        if(!search){
            return res.status(400).json({message:"search query required"});
        }

        const users = await user.find({ username:{$regex:search, $options:"i"},});
        res.status(200).json(users);
    }
    catch(err){
     console.error("Search user error:", err);
     res.status(500).json({message:"server err"});
    }
};

const getUserByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ success: 0, message: "Employee ID is required" });
    }

    const userData = await user.findOne({ employeeId: employeeId }).select("username email phoneNumber role createdAt updatedAt profileImage name dob");
    if (!userData) return res.status(404).json({ success: 0, message: "User not found for this employee" });
    return res.json({ success: 1, data: userData });
  } catch (err) {
    console.error("getUserByEmployeeId error:", err);
    return res.status(500).json({ success: 0, message: "server err" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: 0, message: "User ID is required" });
    }

    const userData = await user.findById(id).select("username email phoneNumber role createdAt updatedAt profileImage name dob");
    if (!userData) return res.status(404).json({ success: 0, message: "User not found" });
    return res.json({ success: 1, data: userData });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ success: 0, message: "server err" });
  }
};

const getMyProfile = async (req, res) => {
  try {

    if (!req.user?.id) {
      return res.status(401).json({ success: 0, message: "Unauthorized" });
    }

    const currentUser = await user
      .findById(req.user.id)
      .select("username email phoneNumber role createdAt updatedAt profileImage name dob");

    if (!currentUser) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    return res.json({
      success: 1,
      data: currentUser
    });

  } catch (err) {

    console.error("Get profile error:", err);

    return res.status(500).json({
      success: 0,
      message: "server err"
    });

  }
};

const updateMyProfile = async (req, res) => {
  try {
    const patch = {};
    if (typeof req.body?.username === "string") patch.username = req.body.username.trim();
    if (typeof req.body?.name === "string") { 
      const trimmedName = req.body.name.trim();
      if (trimmedName) patch.name = trimmedName; // Only add if not empty
    }
    if (typeof req.body?.email === "string") patch.email = req.body.email.toLowerCase().trim();
    if (typeof req.body?.phoneNumber === "string") patch.phoneNumber = req.body.phoneNumber.trim();
    if (typeof req.body?.dob === "string") patch.dob = req.body.dob;
    
    // Handle profile image upload
    if (req.file?.filename) {
      const proto = (req.headers["x-forwarded-proto"] || req.protocol);
      const host = (req.headers["x-forwarded-host"] || req.get("host"));
      patch.profileImage = `${proto}://${host}/uploads/${req.file.filename}`;
    }
    
    if (!Object.keys(patch).length) {
      return res.status(400).json({ success: 0, message: "No valid fields provided" });
    }

    const updated = await user.findByIdAndUpdate(req.user.id, patch, {
      returnDocument: 'after', // Fix deprecation warning
      runValidators: true,
    }).select("username email phoneNumber role createdAt updatedAt profileImage name dob");

    if (!updated) return res.status(404).json({ success: 0, message: "User not found" });
    return res.json({ success: 1, message: "Profile updated", data: updated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: 0, message: "username/email/phoneNumber already exists" });
    }
    return res.status(500).json({ success: 0, message: "server err" });
  }
};

module.exports = {searchuser, getUserByEmployeeId, getUserById, getMyProfile, updateMyProfile };