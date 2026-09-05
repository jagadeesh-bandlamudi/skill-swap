const express = require("express");
const router = express.Router();
const protect  = require("../middleware/auth");
const {
  sendRequest,
  getReceivedRequests,
  getSentRequests,  
  acceptRequest,
  rejectRequest,
  cancelRequest     
} = require("../controllers/requestController");

// Send request
router.post("/send", protect, sendRequest);

// Get received requests
router.get("/received", protect, getReceivedRequests);

//Get sent requests
router.get("/sent", protect, getSentRequests);

// Accept / Reject requests
router.patch("/:id/accept", protect, acceptRequest);
router.patch("/:id/reject", protect, rejectRequest);

//Cancel sent request
router.patch("/:id/cancel", protect, cancelRequest);

module.exports = router;
