const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().populate("recommendedBy", "username");
    const booksData = books.map(book => ({
      id: book._id,
      title: book.title,
      author: book.author,
      likes: book.likes.length,
      comments: book.comments,
      recommendedBy: book.recommendedBy?._id || null,
      recommendedByName: book.recommendedBy?.username || "Unknown",
      createdAt: book.createdAt
    }));
    res.json(booksData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Post new book
router.post("/", async (req, res) => {
  const { title, author, description, genre, userId } = req.body;
  try {
    const book = new Book({ title, author, description, genre, recommendedBy: userId });
    await book.save();
    res.json({ message: "Book added successfully", book });
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// Like book
router.post("/:id/like", async (req, res) => {
  const { userId } = req.body;
  try {
    const book = await Book.findById(req.params.id);
    if (!book.likes.includes(userId)) book.likes.push(userId);
    await book.save();
    res.json({ likes: book.likes.length });
  } catch {
    res.status(500).json({ error: "Failed to like book" });
  }
});

// Comment book
router.post("/:id/comment", async (req, res) => {
  const { userId, text } = req.body;
  try {
    const book = await Book.findById(req.params.id);
    book.comments.push({ user: userId || "Anonymous", text });
    await book.save();
    res.json({ commentsCount: book.comments.length });
  } catch {
    res.status(500).json({ error: "Failed to comment" });
  }
});

module.exports = router;