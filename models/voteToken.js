const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  remainingTry: {
    type: Number,
    required: true
  }
});

const voteTokenSchema = new mongoose.Schema(
  {
    valueHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId
    },
    participant: { type: [{
        name: { type: String },
        email: { type: String },
        no: { type: String }
      }]
    },
    usedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("vote_token", voteTokenSchema);
