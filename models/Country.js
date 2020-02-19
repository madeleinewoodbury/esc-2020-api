const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  emoji: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: true
  },
  participations: {
    type: Number,
    required: true
  },
  firstParticipation: {
    type: String,
    required: true
  },
  victories: {
    type: [String],
    default: 'None'
  },
  hosts: {
    type: [String],
    default: 'Never hosted'
  },
  bio: {
    type: [String]
  }
});

module.exports = Country = mongoose.model('country', CountrySchema);
