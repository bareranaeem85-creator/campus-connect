const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    date: { type: Date, required: true, index: true }, // calendar day of the event
    time: { type: String, required: true, match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format'] }, // "HH:mm"
    venue: { type: String, required: true, trim: true, maxlength: 150 },
    status: { type: String, enum: ['scheduled', 'cancelled'], default: 'scheduled' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
