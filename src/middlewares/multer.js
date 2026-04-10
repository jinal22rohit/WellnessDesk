const multer = require("multer");
const path = require("path");

// storage location
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Absolute uploads dir so server cwd changes don't break saving files
    cb(null, path.join(__dirname, "..", "uploads"));
  },

  filename: function (req, file, cb) {
    // Preserve original extension so Express serves the correct Content-Type.
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}${ext || ".jpg"}`);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;  