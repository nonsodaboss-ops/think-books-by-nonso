require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Book = require("./models/Book");
const Follow = require("./models/Follow");

const app = express();

app.use(cors());
app.use(express.json());

console.log("Mongo URI:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: "Username, password, and email required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    res.json({
      message: "Registration successful",
      userId: user._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// Login user
app.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Missing username or password" });

    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.password !== password)
      return res.status(400).json({ error: "Incorrect password" });

    res.json({
      user: { _id: user._id, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Recommend a book
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, description, genre, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const book = new Book({
      title,
      author,
      description,
      genre,
      recommendedBy: user._id,
      recommendedByName: user.username,
    });

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save book" });
  }
});

// Follow user
app.post("/api/users/:id/follow", async (req, res) => {
  const follow = new Follow({
    followerId: req.body.followerId,
    followingId: req.params.id,
  });

  await follow.save();

  res.json({ message: "User followed" });
});

// Search books by query
app.get("/api/books/search", async (req, res) => {
  try {
    const { q } = req.query; // the search term
    if (!q) return res.json([]); // empty search

    // Case-insensitive partial match
    const books = await Book.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { genre: { $regex: q, $options: "i" } },
      ],
    });

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

// Feed
app.get("/api/users/:userId/feed", async (req, res) => {
  const follows = await Follow.find({ followerId: req.params.userId });

  const ids = follows.map((f) => f.followingId);

  const books = await Book.find({
    recommendedBy: { $in: ids },
  });

  res.json(books);
});

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
app.post("/api/books/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Ensure likes is always an array
    if (!Array.isArray(book.likes)) {
      book.likes = [];
    }

    // Prevent duplicate likes
    if (!book.likes.some((id) => id.toString() === userId)) {
      book.likes.push(userId);
    }

    await book.save();

    res.json({ likes: book.likes.length });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Failed to like book" });
  }
});

// Comment on a book
app.post("/api/books/:id/comment", async (req, res) => {
  try {
    const { user, text } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.comments.push({
      user,
      text,
      date: new Date(),
    });

    await book.save();

    res.json({
      commentsCount: book.comments.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to comment" });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const search = req.query.search?.trim(); // get the search query and trim spaces
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { genre: { $regex: search, $options: "i" } },
        ],
      };
    }

    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

// GET all books (with optional search)
app.get("/api/books", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Case-insensitive search for title OR author
      const regex = new RegExp(search, "i");
      query = { $or: [{ title: regex }, { author: regex }] };
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
