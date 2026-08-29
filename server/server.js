import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import { seedDatabase } from './utils/seed.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Database Connection ──────────────────────────────
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Attempt 1 — remote / .env URI
  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB (remote)');
      return;
    } catch (err) {
      console.warn('⚠️  Remote MongoDB connection failed:', err.message);
    }
  }

  // Attempt 2 — local MongoDB
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/nexus-crm');
    console.log('✅ Connected to MongoDB (local)');
    return;
  } catch {
    console.warn('⚠️  Local MongoDB not available — trying in-memory fallback …');
  }

  // Attempt 3 — in-memory (dev only)
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to MongoDB (in-memory)');
  } catch (err) {
    console.error('❌ All MongoDB connection attempts failed:', err.message);
    process.exit(1);
  }
}

// ── Start ────────────────────────────────────────────
(async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Nexus CRM Server running on port ${PORT}`);
    console.log(`   API base: /api`);
  });
})();
