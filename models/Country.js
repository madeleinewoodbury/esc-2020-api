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
  image: {
    type: String,
    default:
      'https://eurovision.tv/images/placeholder.jpg?id=cb2836e4db74575ca788'
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
    default: ['None']
  },
  hosts: {
    type: [String],
    default: ['Never hosted']
  },
  intro: {
    type: String
  },
  bio: {
    type: String
  },
  youtube: {
    type: String
  }
});

module.exports = Country = mongoose.model('country', CountrySchema);
