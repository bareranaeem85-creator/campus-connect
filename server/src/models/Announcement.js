const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    link: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // createdAt = publication date & time
);

module.exports = mongoose.model('Announcement', announcementSchema);
