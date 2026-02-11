const mongoose = require('mongoose');

const thumbnailSchema = new mongoose.Schema({
  user: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
  videoName:{type:String, required:true},
  image:{type:String, required:true},
  version:{type:String},
  paid:{type:Boolean, default:false},
})

module.exports = mongoose.model("Thumbnail", thumbnailSchema);