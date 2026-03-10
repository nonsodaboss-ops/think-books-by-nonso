const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  followerId:String,
  followingId:String
});

module.exports = mongoose.model("Follow", followSchema);