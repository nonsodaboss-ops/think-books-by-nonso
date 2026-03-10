// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/think-books", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas & Models
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recommendedByName: String,
  likes: { type: Number, default: 0 },
  comments: [
    {
      userId: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);

// Routes

// Get all books
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Like a book
app.post("/api/books/:bookId/like", async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    book.likes += 1;
    await book.save();
    res.json({ likes: book.likes });
  } catch {
    res.status(500).json({ message: "Failed to like book" });
  }
});

// Comment on a book
app.post("/api/books/:bookId/comment", async (req, res) => {
  const { userId, text } = req.body;
  if (!text)
    return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.comments.push({ userId, text });
    await book.save();
    res.json({ commentsCount: book.comments.length });
  } catch {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// Follow a user
app.post("/api/users/:userId/follow", async (req, res) => {
  const { followerId } = req.body;
  try {
    const userToFollow = await User.findById(req.params.userId);
    const follower = await User.findById(followerId);
    if (!userToFollow || !follower)
      return res.status(404).json({ message: "User not found" });

    if (!follower.following.includes(userToFollow._id)) {
      follower.following.push(userToFollow._id);
      await follower.save();
    }

    res.json({ message: `You are now following ${userToFollow.username}` });
  } catch {
    res.status(500).json({ message: "Failed to follow user" });
  }
});

// Get user feed (books by people they follow)
app.get("/api/users/:userId/feed", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const books = await Book.find({ recommendedBy: { $in: user.following } });
    res.json(books);
  } catch {
    res.status(500).json({ message: "Failed to load feed" });
  }
});

// Register a user
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const newUser = await User.create({ username, email, password });
    res.json({
      message: "User registered",
      userId: newUser._id,
      username: newUser.username,
    });
  } catch {
    res.status(500).json({ message: "Failed to register user" });
  }
});

// Add a book recommendation
app.post("/api/books", async (req, res) => {
  const { title, author, recommendedBy, recommendedByName } = req.body;
  if (!title || !author || !recommendedBy || !recommendedByName)
    return res.status(400).json({ message: "Missing book info" });

  try {
    const newBook = await Book.create({
      title,
      author,
      recommendedBy,
      recommendedByName,
    });
    res.json(newBook);
  } catch {
    res.status(500).json({ message: "Failed to add book" });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on https://localhost:${PORT}`),
);
