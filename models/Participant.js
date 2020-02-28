const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParticipantSchema = new Schema({
  country: {
    type: String,
    required: true
  },
  countryId: {
    type: String,
    required: true
  },
  emoji: {
    type: String
  },
  flag: {
    type: String
  },
  artist: {
    type: String,
    required: true
  },
  song: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default:
      'https://eurovision.tv/images/placeholder.jpg?id=cb2836e4db74575ca788'
  },
  intro: {
    type: String
  },
  bio: {
    type: String
  },
  writtenBy: {
    type: String,
    default: 'Unknown'
  },
  composedBy: {
    type: String,
    default: 'Unknown'
  },
  semifinal: {
    type: String,
    required: true
  },
  final: {
    type: Boolean,
    default: false
  },
  youtube: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  },
  year: {
    type: Number
  },
  votes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      vote: {
        type: Number
      }
    }
  ]
});

module.exports = Participant = mongoose.model('participant', ParticipantSchema);
