const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Participant = require('../models/Participant');
const Country = require('../models/Country');
const User = require('../models/User');

// @route   POST /api/participants
// @desc    Create a participant
// @acess   Private
router.post(
  '/',
  [
    auth,
    [
      check('country', 'Country is required')
        .not()
        .isEmpty(),
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

      const country = await Country.findOne({
        name: req.body.country
      });

      if (!country) {
        return res.status(400).json({ msg: 'Country not found' });
      }

      // Creat new instance of country
      const newParticipant = new Participant({
        country: req.body.country,
        countryId: country._id,
        emoji: country.emoji,
        flag: country.flag,
        artist: req.body.artist,
        song: req.body.song,
        image: req.body.image
          ? req.body.image
          : 'https://eurovision.tv/images/placeholder.jpg?id=cb2836e4db74575ca788',
        intro: req.body.intro && req.body.intro,
        bio: req.body.bio && req.body.bio,
        writtenBy: req.body.writtenBy ? req.body.writtenBy : 'Unknown',
        composedBy: req.body.composedBy ? req.body.composedBy : 'Unknown',
        semifinal: req.body.semifinal,
        final: req.body.final && req.body.final,
        youtube: req.body.youtube && req.body.youtube,
        year: req.body.year && req.body.year,
        points: req.body.points && req.body.points
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
      check('country', 'Country is required')
        .not()
        .isEmpty(),
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

    const country = await Country.findOne({
      name: req.body.country
    });

    if (!country) {
      return res.status(400).json({ msg: 'Country not found' });
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
      youtube,
      year,
      points
    } = req.body;

    const participantFields = {};
    participantFields.country = country.name;
    participantFields.emoji = country.emoji;
    participantFields.flag = country.flag;
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
    if (year) participantFields.year = year;
    if (points) participantFields.points = points;

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

// @route    POST api/participants/vote/:id/:vote
// @desc     Vote on a participant
// @access   Private
router.post('/vote/:id/:vote', [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const participant = await Participant.findById(req.params.id);
    const user = await User.findById(req.user.id);

    // Check if user has voted on participant before
    let userVote = await user.votes.find(
      vote => vote.participant.toString() === req.params.id
    );

    // Update the new vote
    if (userVote) {
      userVote.vote = req.params.vote;
      user.votes.sort((a, b) => (a.vote < b.vote ? 1 : -1));
      await user.save();

      let participantVote = await participant.votes.find(
        vote => vote.user.toString() === req.user.id
      );

      participantVote.vote = req.params.vote;
      await participant.save();

      return res.json(participant);
    }

    // Create a new vote for the user
    const newUserVote = {
      participant: participant._id,
      vote: req.params.vote
    };

    // Create a new vote for the participant
    const newParticipantVote = {
      user: req.user.id,
      vote: req.params.vote
    };

    user.votes.unshift(newUserVote);
    participant.votes.unshift(newParticipantVote);

    user.votes.sort((a, b) => (a.vote < b.vote ? 1 : -1));
    await user.save();
    await participant.save();

    res.json(participant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/participants/:id/votes
// @desc     Get participants total votes
// @access   Private
router.get('/:id/votes', [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      res.status(400).json({ msg: 'Participant not found' });
    }

    const votes = participant.votes.map(vote => vote);

    if (votes.length < 1) {
      res.status(400).json({ msg: 'No votes found' });
    }

    let totalVotes = 0;
    votes.map(vote => (totalVotes += vote.vote));

    res.json({ total: totalVotes, votes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/participants/year/:id
// @desc     Get participants by year
// @access   Public
router.get('/year/:year', async (req, res) => {
  try {
    const participants = await Participant.find({ year: req.params.year });
    if (!participants) {
      res.status(400).json({ msg: 'No participants not found' });
    }

    res.json(participants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
