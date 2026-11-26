const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_TITLES = ['HOD', 'Head CR', 'Head GR'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    // Platform role. "Moderator" is per-club (see Club.moderators), not a global role.
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    adminTitle: { type: String, enum: [...ADMIN_TITLES, null], default: null },
    bio: { type: String, maxlength: 200, default: '' },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

// Hash password whenever it is set/changed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// Never leak password hash in JSON responses.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.ADMIN_TITLES = ADMIN_TITLES;
