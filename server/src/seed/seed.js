// CLI: `npm run seed` — resets the database pointed to by MONGO_URI with demo data.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const { seedDatabase } = require('./seedData');

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('Set MONGO_URI in server/.env first (the dev server auto-seeds its in-memory DB).');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  await seedDatabase();
  await mongoose.disconnect();
})();
