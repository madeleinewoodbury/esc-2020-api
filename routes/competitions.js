const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Country = require('../models/Country');

// @route   POST /api/competitions
// @desc    Create a competition
// @acess   Private
router.post(
  '/',
  auth,
  [
    [
      check('year', 'Year is required')
        .not()
        .isEmpty(),
      check('host', 'Host is required')
        .not()
        .isEmpty(),
      check('country', 'Country is required')
        .not()
        .isEmpty(),
      check('logo', 'Logo is required')
        .not()
        .isEmpty(),
      check('winner', 'Winner is required')
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

      // Check if competition exists
      let competition = await Competition.findOne({ year: req.body.year });
      if (competition) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Competition already exist in database' }] });
      }

      const country = await Country.findOne({
        name: req.body.country
      });

      if (!country) {
        return res.status(400).json({ msg: 'Country not found' });
      }

      // Creat new instance of competition
      const newCompetition = new Competition({
        year: req.body.year,
        host: req.body.host,
        country: req.body.country,
        countryId: country._id,
        emoji: country.emoji,
        logo: req.body.logo,
        image: req.body.image && req.body.image,
        winner: req.body.winner,
        intro: req.body.intro && req.body.intro,
        bio: req.body.bio && req.body.bio,
        youtube: req.body.youtube && req.body.youtube
      });

      competition = await newCompetition.save();
      res.json(competition);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/competitions
// @desc    Get all competitions
// @acess   Public
router.get('/', async (req, res) => {
  try {
    const competitions = await Competition.find().sort({ year: -1 });

    if (!competitions) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'No competitions in database' }] });
    }

    res.json(competitions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/competitions/:id
// @desc    Get single competition by id
// @acess   Public
router.get('/:id', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Competition not found' }] });
    }

    res.json(competition);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Competition not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/competitions/:id
// @desc    Update a competition
// @acess   Private
router.put(
  '/:id',
  [
    auth,
    [
      check('year', 'Year is required')
        .not()
        .isEmpty(),
      check('host', 'Host is required')
        .not()
        .isEmpty(),
      check('country', 'Country is required')
        .not()
        .isEmpty(),
      check('logo', 'Logo is required')
        .not()
        .isEmpty(),
      check('winner', 'Winner is required')
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

    const { year, host, logo, image, winner, intro, bio, youtube } = req.body;
    const competitionFields = {};
    competitionFields.country = country.name;
    competitionFields.emoji = country.emoji;
    if (year) competitionFields.year = year;
    if (host) competitionFields.host = host;
    if (logo) competitionFields.logo = logo;
    if (image) competitionFields.image = image;
    if (winner) competitionFields.winner = winner;
    if (intro) competitionFields.intro = intro;
    if (bio) competitionFields.bio = bio;
    if (youtube) competitionFields.youtube = youtube;

    try {
      let competition = await Competition.findById(req.params.id);
      if (!competition) {
        res.status(400).json({ msg: 'competition not found' });
      }

      // Check if user is authorized
      const user = await User.findById(req.user.id).select('-password');
      if (user.role !== 'admin') {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User not authorized' }] });
      }

      // Update the new competition
      competition = await Competition.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: competitionFields },
        { new: true }
      );
      return res.json(competition);
    } catch (err) {
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Competition not found' });
      }
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/competitions/:id
// @desc    Delete a competition
// @acess   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      res.status(400).json({ msg: 'Competition not found' });
    }
    // Check if user is authorized
    const user = await User.findById(req.user.id).select('-password');
    if (user.role !== 'admin') {
      return res.status(400).json({ msg: 'User not authorized' });
    }

    await competition.remove();
    res.json({ msg: 'Competition deleted' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Competition not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
