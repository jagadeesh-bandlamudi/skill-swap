const Request = require("../models/Request");
const User = require("../models/User");


//SEND REQUEST
exports.sendRequest = async (req, res) => {
    console.log("req.user:", req.user);

  try {
    const { toUser } = req.body;
    const fromUser = req.user.id;

    if (fromUser.toString() === toUser.toString()) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    // Check if request already exists
    const existing = await Request.findOne({ fromUser, toUser, status: "pending" });
    if (existing) return res.status(400).json({ message: "Request already sent" });

    const newRequest = await Request.create({ fromUser, toUser, status: "pending" });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//RECEIVED REQUESTS
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ toUser: req.user.id })
      .populate("fromUser", "profile.fullName profile.skillsOffered profile.skillsToLearn profile.bio profile.username profile.availability profilePicture")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//SENT REQUESTS
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ fromUser: req.user.id })
      .populate("toUser", "profile.fullName profile.skillsOffered profile.skillsToLearn profile.bio profile.username profilePicture")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//ACCEPT REQUEST
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.toUser.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    request.status = "accepted";
    await request.save();

    res.json({ message: "Request accepted", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//REJECT REQUEST
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.toUser.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//CANCEL REQUEST
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.fromUser.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    request.status = "cancelled";
    await request.save();

    res.json({ message: "Request cancelled", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
