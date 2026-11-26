const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'link'], default: 'text' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, maxlength: 5000, default: '' },
    url: { type: String, default: '' },
    // Optional uploaded image/document (see Attachment model)
    attachment: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      mimetype: { type: String, default: '' },
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pinned: { type: Boolean, default: false },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
