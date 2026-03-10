const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Follow a user
router.post("/:id/follow", async (req, res) => {
  const { followerId } = req.body;
  try {
    const user = await User.findById(followerId);
    if (!user.following.includes(req.params.id)) {
      user.following.push(req.params.id);
      await user.save();
    }
    res.json({ message: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Follow failed" });
  }
});

// Unfollow a user
router.post("/:id/unfollow", async (req, res) => {
  const { followerId } = req.body;
  try {
    const user = await User.findById(followerId);
    user.following = user.following.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.json({ message: "User unfollowed" });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed" });
  }
});

// Get feed for user
router.get("/:id/feed", async (req, res) => {
  const UserModel = require("../models/User");
  const Book = require("../models/Book");

  try {
    const user = await UserModel.findById(req.params.id);
    const books = await Book.find({ recommendedBy: { $in: user.following } })
      .populate("recommendedBy", "username")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Feed error" });
  }
});

module.exports = router;