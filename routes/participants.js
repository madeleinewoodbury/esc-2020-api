const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Participant = require('../models/Participant');
const Country = require('../models/Country');
const User = require('../models/User');

// @route   POST /api/participants/:countryId
// @desc    Create a participant
// @acess   Private
router.post(
  '/:countryId',
  [
    auth,
    [
      check('artist', 'Artist name is required')
        .not()
        .isEmpty(),
      check('song', 'Song is required')
        .not()
        .isEmpty(),
      check('semifinal', 'Semifinal is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is authorized
      const user = await User.findById(req.user.id).select('-password');
      if (user.role !== 'admin') {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User not authorized' }] });
      }

      // Check if country exist
      const country = await Country.findById(req.params.countryId);

      if (!country) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Country does not exist in database.' }] });
      }

      // Creat new instance of country
      const newParticipant = new Participant({
        country: country.name,
        emoji: country.emoji,
        flag: country.flag,
        artist: req.body.artist,
        song: req.body.song,
        image: req.body.image && req.body.image,
        intro: req.body.intro && req.body.intro,
        bio: req.body.bio && req.body.bio,
        writtenBy: req.body.writtenBy && req.body.writtenBy,
        composedBy: req.body.composedBy && req.body.composedBy,
        semifinal: req.body.semifinal,
        final: req.body.final && req.body.final,
        youtube: req.body.youtube && req.body.youtube
      });

      const participant = await newParticipant.save();
      res.json(participant);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/participants
// @desc    Get all participants
// @acess   Public
router.get('/', async (req, res) => {
  try {
    const participants = await Participant.find().sort({ country: 1 });

    if (participants.length < 1) {
      return res.status(400).json({ msg: 'No participants found' });
    }

    res.json(participants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/participants/:id
// @desc    Get single participants
// @acess   Public
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(400).json({ msg: 'Participants found' });
    }

    res.json(participant);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Participant not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/participants/:id
// @desc    Update a participant
// @acess   Private
router.put(
  '/:id',
  [
    auth,
    [
      check('artist', 'Artist name is required')
        .not()
        .isEmpty(),
      check('song', 'Song is required')
        .not()
        .isEmpty(),
      check('semifinal', 'Semifinal is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      artist,
      song,
      image,
      intro,
      bio,
      writtenBy,
      composedBy,
      semifinal,
      final,
      youtube
    } = req.body;

    const participantFields = {};
    if (artist) participantFields.artist = artist;
    if (song) participantFields.song = song;
    if (image) participantFields.image = image;
    if (intro) participantFields.intro = intro;
    if (bio) participantFields.bio = bio;
    if (writtenBy) participantFields.writtenBy = writtenBy;
    if (composedBy) participantFields.composedBy = composedBy;
    if (semifinal) participantFields.semifinal = semifinal;
    if (final) participantFields.final = final;
    if (youtube) participantFields.youtube = youtube;

    try {
      let participant = await Participant.findById(req.params.id);
      if (!participant) {
        res.status(400).json({ msg: 'Participant not found' });
      }

      // Check if user is authorized
      const user = await User.findById(req.user.id).select('-password');
      if (user.role !== 'admin') {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User not authorized' }] });
      }

      // Update the new participant
      participant = await Participant.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: participantFields },
        { new: true }
      );
      return res.json(participant);
    } catch (err) {
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Participant not found' });
      }
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/participants/:id
// @desc    Delete a participant
// @acess   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) {
      res.status(400).json({ msg: 'Participant not found' });
    }
    // Check if user is authorized
    const user = await User.findById(req.user.id).select('-password');
    if (user.role !== 'admin') {
      return res.status(400).json({ errors: [{ msg: 'User not authorized' }] });
    }

    await participant.remove();
    res.json({ msg: 'Participant deleted' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Participant not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    POST api/participants/vote/:id
// @desc     Vote on a participant
// @access   Private
router.post(
  '/vote/:id',
  [
    auth,
    [
      check('vote', 'Vote is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const participant = await Participant.findById(req.params.id);

      // Check if user has voted on participant before
      let vote = await participant.votes.find(
        vote => vote.user.toString() === req.user.id
      );

      // Update the new vote
      if (vote) {
        vote.vote = req.body.vote;
        await participant.save();

        return res.json(participant);
      }

      // Create a new vote for the user
      const newVote = {
        user: req.user.id,
        vote: req.body.vote
      };

      participant.votes.unshift(newVote);

      await participant.save();

      res.json(participant);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
