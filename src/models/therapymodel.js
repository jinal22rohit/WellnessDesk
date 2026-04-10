const mongoose = require('mongoose');

const therapyschema = new mongoose.Schema({

therapyImage:{type: String,},
therapyName:{type:String,},
therapyprice:{type:Number,},
duration:{type:Number,},
category:{type:String},
}, {timestamps:true});

module.exports = mongoose.model("therapy",therapyschema);

  