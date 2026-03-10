const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  genre: String,
  recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recommendedByName: String,
  likes: { 
    type: [{type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: []
  },
  comments: [
    {
      user: { type: String, default: "Anonymous" },
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
