const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Country = require('../models/Country');
const User = require('../models/User');

// @route   POST /api/countries
// @desc    Create a country
// @acess   Private
router.post(
  '/',
  auth,
  [
    [
      check('name', 'Country name is required')
        .not()
        .isEmpty(),
      check('emoji', 'Flag emoji is required')
        .not()
        .isEmpty(),
      check('flag', 'Flag image is required')
        .not()
        .isEmpty(),
      check('participations', 'Participations is required')
        .not()
        .isEmpty(),
      check('firstParticipation', 'First participation is required')
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

      // Check if country exists
      let country = await Country.findOne({ name: req.body.name });
      if (country) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Country already exist in database' }] });
      }

      // Creat new instance of country
      const newCountry = new Country({
        name: req.body.name,
        emoji: req.body.emoji,
        flag: req.body.flag,
        image: req.body.image && req.body.image,
        participations: req.body.participations,
        firstParticipation: req.body.firstParticipation,
        victories:
          req.body.victories &&
          req.body.victories.split(',').map(item => item.trim()),
        hosts:
          req.body.hosts && req.body.hosts.split(',').map(item => item.trim()),
        intro: req.body.intro && req.body.intro,
        bio: req.body.bio && req.body.bio,
        youtube: req.body.youtube && req.body.youtube
      });

      country = await newCountry.save();
      res.json(country);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/countries
// @desc    Get all countries
// @acess   Public
router.get('/', async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });

    if (!countries) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'No countries in database' }] });
    }

    res.json(countries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/countries/:name
// @desc    Get single id
// @acess   Public
router.get('/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(400).json({ errors: [{ msg: 'Country not found' }] });
    }

    res.json(country);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Country not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/countries/:id
// @desc    Update a country
// @acess   Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Country name is required')
        .not()
        .isEmpty(),
      check('emoji', 'Flag emoji is required')
        .not()
        .isEmpty(),
      check('flag', 'Flag image is required')
        .not()
        .isEmpty(),
      check('participations', 'Participations is required')
        .not()
        .isEmpty(),
      check('firstParticipation', 'First participation is required')
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
      name,
      emoji,
      flag,
      image,
      participations,
      firstParticipation,
      victories,
      hosts,
      intro,
      bio,
      youtube
    } = req.body;
    const countryFields = {};
    if (name) countryFields.name = name;
    if (emoji) countryFields.emoji = emoji;
    if (flag) countryFields.flag = flag;
    if (image) countryFields.image = image;
    if (participations) countryFields.participations = participations;
    if (firstParticipation)
      countryFields.firstParticipation = firstParticipation;
    if (victories)
      countryFields.victories = victories.split(',').map(item => item.trim());
    if (hosts) countryFields.hosts = hosts.split(',').map(item => item.trim());
    if (intro) countryFields.intro = intro;
    if (bio) countryFields.bio = bio;
    if (youtube) countryFields.youtube = youtube;

    try {
      let country = await Country.findById(req.params.id);
      if (!country) {
        res.status(400).json({ msg: 'Country not found' });
      }

      // Check if user is authorized
      const user = await User.findById(req.user.id).select('-password');
      if (user.role !== 'admin') {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User not authorized' }] });
      }

      // Update the new country
      country = await Country.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: countryFields },
        { new: true }
      );
      return res.json(country);
    } catch (err) {
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Country not found' });
      }
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/countries/:id
// @desc    Delete a country
// @acess   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      res.status(400).json({ msg: 'country not found' });
    }
    // Check if user is authorized
    const user = await User.findById(req.user.id).select('-password');
    if (user.role !== 'admin') {
      return res.status(400).json({ msg: 'User not authorized' });
    }

    await country.remove();
    res.json({ msg: 'Country deleted' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Country not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
