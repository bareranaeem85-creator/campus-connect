const mongoose = require('mongoose');

const clubRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, required: true, maxlength: 500 },
    reason: { type: String, required: true, maxlength: 500 },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, maxlength: 300, default: '' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' }, // set when approved
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClubRequest', clubRequestSchema);
