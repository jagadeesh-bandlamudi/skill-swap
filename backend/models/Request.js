const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
     type: String, enum: ["pending", "accepted", "rejected", "cancelled", "completed"], 
     default: "pending" 
    },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ users who marked complete
  createdAt: { type: Date, default: Date.now },
}, 
{timestamps:true});

module.exports = mongoose.model("Request", requestSchema);
