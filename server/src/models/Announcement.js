const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    link: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' }, // external URL or our own /api/uploads/<id>
    attachmentName: { type: String, default: '' }, // original filename for uploaded files
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // createdAt = publication date & time
);

module.exports = mongoose.model('Announcement', announcementSchema);
