const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Import our new admin middleware
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const sendEmail = require('../utils/sendEmail');


// --- Dashboard Stats ---
// @route   GET api/admin/stats
// @desc    Get dashboard stats (total users, total feedback)
// @access  Admin
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const newFeedbackCount = await Feedback.countDocuments({ status: 'new' });

    res.json({
      users: userCount,
      feedback: feedbackCount,
      newFeedback: newFeedbackCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- User Management ---
// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Find all, remove password
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Feedback Management ---
// @route   GET api/admin/feedback
// @desc    Get all feedback
// @access  Admin
router.get('/feedback', [auth, admin], async (req, res) => {
  try {
    // Populate 'user' field with their email and fullName
    const feedback = await Feedback.find()
      .populate('user', 'email profile.fullName') 
      .sort({ createdAt: -1 }); // Show newest first
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/admin/feedback/:id
// @desc    Update a feedback item's status
// @access  Admin
router.patch('/feedback/:id', [auth, admin], async (req, res) => {
  const { status } = req.body;

  // Simple validation
  if (!['new', 'in-progress', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    feedback.status = status;
    await feedback.save();
    
    // Return the updated feedback item
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Update User Role ---
// @route   PATCH api/admin/users/:id
// @desc    Update a user's role
// @access  Admin
router.patch('/users/:id', [auth, admin], async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();
    
    // Return the updated user (without password)
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// ... (your other routes)

// --- Delete a User ---
// @route   DELETE api/admin/users/:id
// @desc    Delete a user account
// @access  Admin
router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const adminUserId = req.user.id;

    // 1. Prevent an admin from deleting their own account
    if (userIdToDelete === adminUserId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // 2. Find the user to delete
    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3. Delete the user
    await User.findByIdAndDelete(userIdToDelete);
    
    // 4. (Optional but recommended) Delete related data.
    // For example, you might want to delete their feedback:
    // await Feedback.deleteMany({ user: userIdToDelete });
    // You could also delete connections, messages, etc.

    res.json({ message: 'User account deleted successfully.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// --- NEW ROUTE: Resolve Feedback AND Notify User ---
// @route   POST api/admin/feedback/:id/notify
// @desc    Update status to 'resolved' and email the user
// @access  Admin
// --- NEW ROUTE: Resolve Feedback AND Notify User ---
// @route   POST api/admin/feedback/:id/notify
// @desc    Update status to 'resolved' and email the user
// @access  Admin
router.post('/feedback/:id/notify', [auth, admin], async (req, res) => {
  const { subject, message } = req.body;
  
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }

  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({ 
        path: 'user', 
        select: 'email profile.fullName'
      });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }
    
    if (!feedback.user || !feedback.user.email) {
      return res.status(400).json({ message: 'User email not found. (User may be deleted)' });
    }

    // 1. Update the status
    feedback.status = 'resolved';
    await feedback.save();

    // 2. Send the email
    const userName = feedback.user.profile?.fullName || 'User';
    
    // This is the HTML body
    const emailBody = `
      <p>Hi ${userName},</p>
      <p>Regarding your feedback on "${feedback.subject}":</p>
      <hr>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p>This issue is now considered resolved. Thank you for helping us improve SkillSwap!</p>
    `;

    // 🌟 THE FIX IS HERE 🌟
    // We now pass a single 'options' object, as your sendEmail function expects.
    await sendEmail({
      email: feedback.user.email,
      subject: subject,
      html: emailBody
    });

    res.json({ message: 'Feedback resolved and user notified.' });

  } catch (err) {
    console.error("CRASH in /notify route:", err.message); 
    res.status(500).send('Server Error');
  }
});



module.exports = router;