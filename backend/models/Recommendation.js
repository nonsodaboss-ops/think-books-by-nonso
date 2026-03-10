const mongoose = require("mongoose");
const { Schema } = mongoose;

const recommendationSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  recommendedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  recommendedByName: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // array of user IDs
  comments: [
    {
      user: { type: Schema.Types.Mixed, default: "Anonymous" },
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recommendation", recommendationSchema);