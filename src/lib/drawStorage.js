import mongoose from 'mongoose';

// Mongoose schema for persistent event draws
const DrawSchema = new mongoose.Schema(
  {
    drawId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    timestamp: { type: String, required: true },
    totalTeams: { type: Number, required: true },
    totalParticipants: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    status: { type: String, default: 'IN_PROGRESS' },
    teams: { type: Array, required: true },
    unassigned: { type: Object, default: () => ({ secondYears: [], firstYears: [], mentors: [] }) },
    revealProgress: {
      revealedMembersCount: { type: Number, default: 0 },
      isAllRevealed: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

let cachedModel = null;
function getDrawModel() {
  if (cachedModel) return cachedModel;
  try {
    cachedModel = mongoose.model('EventDraw');
  } catch {
    cachedModel = mongoose.model('EventDraw', DrawSchema);
  }
  return cachedModel;
}

// Global cached connection for serverless / Next.js environments
let cachedConnection = global.mongoose;
if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB Atlas with connection caching and timeout limits.
 * MongoDB Atlas is the sole authoritative storage.
 */
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  if (cachedConnection.conn && mongoose.connection.readyState === 1) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    };

    cachedConnection.promise = mongoose.connect(uri, opts).then((inst) => {
      return inst;
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
    return cachedConnection.conn;
  } catch (err) {
    cachedConnection.promise = null;
    throw new Error(`MongoDB Atlas connection error: ${err.message}`);
  }
}

/**
 * Saves a generated draw permanently to MongoDB Atlas.
 * Never silently claims success without genuine database persistence.
 */
export async function saveDrawRecord(drawData) {
  if (!drawData || !drawData.drawId) {
    throw new Error('Valid drawId and team data are required.');
  }

  const normalized = {
    drawId: drawData.drawId,
    title: drawData.title || `Hackathon Draw · ${new Date().toISOString().split('T')[0]}`,
    timestamp: drawData.timestamp || new Date().toISOString(),
    totalTeams: drawData.teams?.length || 0,
    totalParticipants: (drawData.teams?.length || 0) * 4,
    isCompleted: Boolean(drawData.isCompleted),
    status: drawData.status || (drawData.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'),
    teams: drawData.teams || [],
    unassigned: drawData.unassigned || { secondYears: [], firstYears: [], mentors: [] },
    revealProgress: drawData.revealProgress || {
      revealedMembersCount: drawData.teams?.reduce(
        (acc, t) => acc + (t.members?.filter((m) => m.revealed)?.length || 0),
        0
      ) || 0,
      isAllRevealed: Boolean(drawData.isCompleted)
    }
  };

  await connectToDatabase();
  const DrawModel = getDrawModel();

  const savedDoc = await DrawModel.findOneAndUpdate(
    { drawId: normalized.drawId },
    normalized,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    success: true,
    draw: savedDoc || normalized,
    storage: 'mongodb'
  };
}

/**
 * Retrieves all saved draws from MongoDB Atlas sorted newest first.
 * Returns legitimate empty array if no records exist in the collection.
 */
export async function getAllDrawRecords() {
  await connectToDatabase();
  const DrawModel = getDrawModel();

  const mongoDocs = (await DrawModel.find({}).sort({ createdAt: -1 }).lean()) || [];

  return {
    draws: mongoDocs,
    storage: 'mongodb'
  };
}

/**
 * Retrieves a single draw by drawId from MongoDB Atlas.
 */
export async function getDrawRecordById(drawId) {
  if (!drawId) return null;

  await connectToDatabase();
  const DrawModel = getDrawModel();

  const doc = await DrawModel.findOne({ drawId }).lean();
  if (doc) {
    return { draw: doc, storage: 'mongodb' };
  }

  return null;
}

/**
 * Updates reveal progress for an active draw in MongoDB Atlas.
 */
export async function updateDrawRecord(drawId, updates) {
  if (!drawId) throw new Error('Draw ID is required');

  await connectToDatabase();
  const DrawModel = getDrawModel();

  await DrawModel.findOneAndUpdate({ drawId }, { $set: updates });

  return { success: true };
}
