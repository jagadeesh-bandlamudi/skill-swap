const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// --- Multer setup for profile pictures (shared /uploads folder) ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
    }
});

const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (/^image\//.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files are allowed.'));
    }
});

// @route   POST /api/profile/picture
// @desc    Upload / update the logged-in user's profile picture
// @access  Private
router.post('/picture', auth, (req, res) => {
    uploadImage.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message || 'Upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ msg: 'No image file provided.' });
        }
        try {
            const fileUrl = `/uploads/${req.file.filename}`;
            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $set: { profilePicture: fileUrl } },
                { new: true }
            ).select('-password');
            res.json({ profilePicture: fileUrl, user });
        } catch (e) {
            console.error('Profile picture error:', e.message);
            res.status(500).send('Server Error');
        }
    });
});

// @route   POST /api/profile
// @access  Private (requires a JWT)
router.post('/', auth, async (req, res) => {
    const {
        fullName,
        username,
        phoneNumber,
        location,
        bio,
        skillsOffered,
        skillsToLearn,
        availability,
        socialLinks
    } = req.body;

    const profileFields = {};
    if (fullName) profileFields.fullName = fullName;
    if (username) profileFields.username = username;
    if (phoneNumber) profileFields.phoneNumber = phoneNumber;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (skillsOffered) profileFields.skillsOffered = skillsOffered;
    if (skillsToLearn) profileFields.skillsToLearn = skillsToLearn;
    if (availability) profileFields.availability = availability;
    if (socialLinks) profileFields.socialLinks = socialLinks;

    try {
        let user = await User.findOneAndUpdate(
            { _id: req.user.id },
            { $set: { profile: profileFields } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route-->   GET /api/profile

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/profile/category/:category
// @desc    Get all users who have skills under a specific category
// @access  Public (you may want to protect later with auth)
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;

    const users = await User.find({
      $or: [
        { "profile.skillsOffered.category": category },
        { "profile.skillsToLearn.category": category }
      ]
    }).select("-password");

    if (!users.length) {
      return res.status(404).json({ msg: "No users found in this category" });
    }

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users by category:", err.message);
    res.status(500).send("Server Error");
  }
});



// @route   GET /api/profile/recommended
// @desc    Recommend users whose skills match your skillsToLearn
// @access  Private
router.get('/recommended', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('profile');
    if (!currentUser) return res.status(404).json({ msg: 'User not found' });

    const skillsToLearn = currentUser.profile?.skillsToLearn?.map(s => s.skillName.toLowerCase()) || [];

    if (!skillsToLearn.length) {
      return res.status(200).json([]); // No skills to recommend on
    }
    const regexSkills = skillsToLearn.map(skill => new RegExp(`^${skill}$`, 'i'));
    // Find users who teach any of those skills
    const recommended = await User.find({
      _id: { $ne: req.user.id }, // exclude self
      "profile.skillsOffered.skillName": { $in: regexSkills }
    }).select("-password");

    res.json(recommended);
  } catch (err) {
    console.error("❌ Error fetching recommended users:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
