const mongoose = require('mongoose');

// Uploaded file stored inside MongoDB (Render's free disk is wiped on restart, so we don't use the filesystem).
const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, maxlength: 200 },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false }, // raw bytes, only loaded when downloading
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', attachmentSchema);
