const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    fileUrl: { type: String },  // store uploaded file path or cloud URL
    fileType: { type: String , enum: ["image","video","document","audio", null], default:null},
    fileName: { type: String },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);