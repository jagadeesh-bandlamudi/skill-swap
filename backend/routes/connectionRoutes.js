const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Request = require("../models/Request");

// GET /api/connections
router.get("/", auth, async (req, res) => {
  try {
    const connections = await Request.find({
      status:{ $in: ["accepted", "completed"]},
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }]
    })
    .populate("fromUser", "profile email profilePicture")
    .populate("toUser", "profile email profilePicture");

    res.json(connections);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// PATCH /api/connections/:id/complete  — mark connection as complete by current user
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const connection = await Request.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // ensure requester is part of this connection
    const userId = req.user.id;
    if (
      connection.fromUser.toString() !== userId &&
      connection.toUser.toString() !== userId
    ) {
      return res.status(403).json({ message: "You are not part of this connection" });
    }

    // Add current user to completedBy if not already present
    if (!connection.completedBy.map(id => id.toString()).includes(userId)) {
      connection.completedBy.push(userId);
    }

    // If both users have marked complete, set status to completed
    const fromId = connection.fromUser.toString();
    const toId = connection.toUser.toString();
    const completedSet = new Set(connection.completedBy.map(id => id.toString()));

    if (completedSet.has(fromId) && completedSet.has(toId)) {
      connection.status = "completed";
    }

    await connection.save();

    // return updated connection (optionally populated)
    const populated = await Request.findById(connection._id)
      .populate("fromUser", "profile email")
      .populate("toUser", "profile email");

    res.json({ message: "Connection marked as complete", connection: populated });
  } catch (err) {
    console.error("Error marking connection complete:", err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
