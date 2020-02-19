const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParticipantSchema = new Schema({
  country: {
    type: Schema.Types.ObjectId,
    ref: 'country'
  },
  artist: {
    type: String,
    default: 'To be announced'
  },
  song: {
    type: String,
    default: 'To be announced'
  },
  image: {
    type: String,
    default:
      'https://eurovision.tv/images/placeholder.jpg?id=cb2836e4db74575ca788'
  },
  bio: {
    type: [String]
  },
  writtenBy: {
    type: String
  },
  composedBy: {
    type: String
  },
  firstSemi: {
    type: Boolean,
    required: true
  },
  secondSemi: {
    type: Boolean,
    required: true
  },
  final: {
    type: Boolean,
    required: true
  },
  youtube: {
    type: String
  }
});

module.exports = Participant = mongoose.model('participant', ParticipantSchema);
