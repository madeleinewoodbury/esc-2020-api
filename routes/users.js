const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Participant = require('../models/Participant');

// @route   POST /api/users
// @desc    Register a new user
// @acess   Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 6 characters or more'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exist' }] });
      }

      // Create instance of new user
      user = new User({ name, email, password });

      // Encrypt password and save user
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    GET api/users/votes
// @desc     Get the users vote
// @access   Private
router.get('/votes', auth, async (req, res) => {
  try {
    const participants = await Participant.find({ 'votes.user': req.user.id });

    if (participants.length < 1) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'No participants found' }] });
    }

    let votes = [];

    // Find the users votes
    participants.forEach(participant => {
      let country = participant.country;
      let userVote = participant.votes.find(
        vote => vote.user.toString() === req.user.id
      );

      let vote = {
        country,
        vote: userVote.vote
      };
      votes.unshift(vote);
    });

    res.json(votes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
