const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// ✅ Get user by ID (for chat, connections, etc.)
// router.get("/:id", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password"); // exclude password
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });



// @route   GET /api/users/search?query=python
// @desc    Search users by name, username, or skills
// @access  Private
router.get("/search", auth, async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) return res.status(400).json({ message: "Query required" });

    // Use $or and regex across nested fields safely
    const users = await User.find({
      $or: [
        { "profile.fullName": { $regex: query, $options: "i" } },
        { "profile.username": { $regex: query, $options: "i" } },
        { "profile.skillsOffered.skillName": { $regex: query, $options: "i" } },
        { "profile.skillsToLearn.skillName": { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.error("❌ Error searching users:", err);
    res.status(500).json({ message: "Server error during search" });
  }
});





router.get("/:id", auth, async (req, res) => {
  try {
    let user;
    if (req.params.id === "me") {
      // return the currently logged in user
      user = await User.findById(req.user.id).select("-password");
    } else {
      user = await User.findById(req.params.id).select("-password");
    }

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});






module.exports = router;
