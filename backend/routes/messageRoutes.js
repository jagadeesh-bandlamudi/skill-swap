const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth");


//Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/")); // create this folder in backend root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation
} = require("../controllers/messageController");

// Get all conversations
router.get("/", auth, getConversations);

// Get chat with specific user
router.get("/:userId", auth, getMessages);

// Send message
router.post("/:userId", auth, upload.single("file"), sendMessage);

// Mark messages as read
router.put("/:userId/read", auth, markAsRead);

// Delete a whole conversation with a user
router.delete("/:userId", auth, deleteConversation);



module.exports = router;
