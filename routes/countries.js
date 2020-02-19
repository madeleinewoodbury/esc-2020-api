const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Country = require('../models/Country');
const User = require('../models/User');

// @route   POST /api/country
// @desc    Create a country
// @acess   Private
router.post(
  '/',
  [
    auth,
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
        participations: req.body.participations,
        firstParticipation: req.body.firstParticipation,
        victories:
          req.body.victories &&
          req.body.victories.split(',').map(item => item.trim()),
        hosts:
          req.body.hosts && req.body.hosts.split(',').map(item => item.trim()),
        bio: req.body.bio && req.body.bio
      });

      country = await newCountry.save();
      res.json(country);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
