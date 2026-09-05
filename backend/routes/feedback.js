const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <-- You should already have this auth middleware
const Feedback = require('../models/Feedback');

/**
 * @route   POST api/feedback
 * @desc    Submit new feedback
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  const { subject, message } = req.body;
  
  // Get the user ID from the 'auth' middleware
  const userId = req.user.id; 

  try {
    // Basic validation
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    const newFeedback = new Feedback({
      user: userId,
      subject,
      message
    });

    await newFeedback.save();

    res.json({ message: 'Feedback submitted successfully. Thank you!' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;