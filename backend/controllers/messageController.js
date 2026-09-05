const Message = require("../models/Message");
const Request = require("../models/Request"); // to check connections

// ✅ Check if two users are connected
async function areConnected(userId1, userId2) {
  const conn = await Request.findOne({
    status: "accepted",
    $or: [
      { fromUser: userId1, toUser: userId2 },
      { fromUser: userId2, toUser: userId1 }
    ]
  });
  return !!conn;
}

// ✅ Get all conversations for logged-in user (sidebar)
// Get all conversations (with lastMessage + unreadCount)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Get all accepted connections
    const connections = await Request.find({
      status: { $in: ["accepted", "completed"] },
      $or: [{ fromUser: userId }, { toUser: userId }]
    })
      .populate("fromUser", "profile email profilePicture")
      .populate("toUser", "profile email profilePicture");

    // Step 2: Build conversation list
    const conversations = [];
    for (let conn of connections) {
      const other =
        conn.fromUser._id.toString() === userId
          ? conn.toUser
          : conn.fromUser;

      // Step 3: Find latest message with this user
      const lastMessage = await Message.findOne({
        $or: [
          { sender: userId, receiver: other._id },
          { sender: other._id, receiver: userId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();

      // Step 4: Count unread messages (sent by "other" → to me, and not marked as read)
      const unreadCount = await Message.countDocuments({
        sender: other._id,
        receiver: userId,
        read: false
      });

      conversations.push({
        user: other,
        lastMessage: lastMessage || null,
        unreadCount
      });
    }

    res.json(conversations);
  } catch (err) {
    console.error("Error in getConversations:", err);
    res.status(500).json({ error: err.message });
  }
};


// ✅ Get all messages with specific user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;

    if (!(await areConnected(userId, otherId))) {
      return res.status(403).json({ message: "You are not connected." });
    }

    const msgs = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(msgs);
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Send a message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherId } = req.params;
    const { text } = req.body;

    if (!(await areConnected(userId, otherId))) {
      return res.status(403).json({ message: "You are not connected." });
    }

    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      const mimeType = req.file.mimetype;

      if (mimeType.startsWith("image")) fileType = "image";
      else if (mimeType.startsWith("video")) fileType = "video";
      else if (mimeType.startsWith("audio")) fileType = "audio";
      else fileType = "document";
    }

    const msg = await Message.create({
      sender: userId,
      receiver: otherId,
      text,
      fileUrl,
      fileType
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Delete an entire conversation between the logged-in user and another user
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;

    const result = await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    });

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Error in deleteConversation:", err);
    res.status(500).json({ error: err.message });
  }
};

// Mark all messages from other user as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;

    await Message.updateMany(
      { sender: otherId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error in markAsRead:", err);
    res.status(500).json({ error: err.message });
  }
};
