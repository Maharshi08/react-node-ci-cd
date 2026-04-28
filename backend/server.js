const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug env (optional)
console.log("DB_URL:", process.env.DB_URL);

// Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

// Routes
app.post("/api/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to save user" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// Connect DB and then start server
mongoose.connect(process.env.DB_URL)
.then(() => {
  console.log("MongoDB Connected");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error("Mongo Error:", err);
});
