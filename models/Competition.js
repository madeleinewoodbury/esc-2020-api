const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompetitionSchema = new Schema({
  year: {
    type: Number,
    unique: true
  },
  host: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default:
      'https://eurovision.tv/images/placeholder.jpg?id=cb2836e4db74575ca788'
  },
  winner: {
    type: String,
    required: true
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

module.exports = Competition = mongoose.model('competition', CompetitionSchema);
