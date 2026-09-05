const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // --- ADD THESE NEW FIELDS ---
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationTokenExpires: {
    type: Date
  },
  // --- END OF NEW FIELDS ---
  passwordResetToken: {
    type: String
  },
  passwordResetTokenExpires: {
    type: Date
  },
  profile: {
    fullName: String,
    username: String,
    location: String,
    bio: String,
    skillsOffered: [
    {
      skillName: { type: String, required: true },
      level: { type: String, required: true },
      category: { type: [String], default: [] }
    }
    ],
    skillsToLearn: [
      {
        skillName: { type: String, required: true },
        level: { type: String, required: true },
        category: { type: [String], default: [] }
      }
    ],

    availability: {
      days: [String],
      time: String,
      timezone: String
    },
    socialLinks: {
      linkedin: String,
      github: String
    }
  }
});

module.exports = mongoose.model('User', UserSchema);