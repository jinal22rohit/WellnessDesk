const mongoose = require("mongoose");

const spaSchema = new mongoose.Schema({
  spaName: {
    type: String,
  },
  spaImg: {
    type: String,
  },
  email: {
    type: String,
  },
  phno: {
    type: String,
  },
  address: {
    type: String,
  },
});

module.exports = mongoose.model("spa",spaSchema);
