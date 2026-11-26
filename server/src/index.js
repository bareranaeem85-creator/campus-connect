require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const app = require('./app');
const connectDB = require('./config/db');
const { seedDatabase } = require('./seed/seedData');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production');
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
}

(async () => {
  try {
    const inMemory = await connectDB();
    // Auto-seed an empty database so demo logins always work.
    if (inMemory || (await User.estimatedDocumentCount()) === 0) {
      await seedDatabase();
    }
    app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
