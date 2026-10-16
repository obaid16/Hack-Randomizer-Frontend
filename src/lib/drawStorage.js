import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Local disk backup path with Vercel serverless /tmp fallback
const PRIMARY_DATA_DIR = path.join(process.cwd(), 'src', 'data');
const PRIMARY_FILE = path.join(PRIMARY_DATA_DIR, 'saved_draws.json');
const TMP_FILE = path.join('/tmp', 'saved_draws.json');

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

// Global cached connection for Next.js / Serverless
let cachedConnection = global.mongoose;
if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;

  if (cachedConnection.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    };

    cachedConnection.promise = mongoose.connect(uri, opts).then((inst) => {
      return inst;
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
    return true;
  } catch (err) {
    cachedConnection.promise = null;
    console.warn('[DrawStorage] MongoDB Atlas connection error, falling back to local persistent storage:', err.message);
    return false;
  }
}

// Resilient File Helper with /tmp write fallback for serverless
function getWritableFile() {
  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    const testFile = path.join(PRIMARY_DATA_DIR, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return PRIMARY_FILE;
  } catch {
    return TMP_FILE;
  }
}

function readLocalDraws() {
  try {
    // Check tmp file first (latest serverless writes)
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Then check bundled/project file
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

function writeLocalDraws(draws) {
  try {
    const targetFile = getWritableFile();
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(draws, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('[DrawStorage] Failed writing local backup file:', e.message);
    return false;
  }
}

/**
 * Saves a generated draw permanently to MongoDB Atlas and local disk backup.
 */
export async function saveDrawRecord(drawData) {
  if (!drawData || !drawData.drawId) {
    throw new Error('Valid drawId and team data are required.');
  }

  const normalized = {
    drawId: drawData.drawId,
    title: drawData.title || `Hackathon Draw · ${new Date().toLocaleDateString()}`,
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

  // Always write to persistent disk backup
  const localDraws = readLocalDraws();
  const existingIdx = localDraws.findIndex((d) => d.drawId === normalized.drawId);
  if (existingIdx >= 0) {
    localDraws[existingIdx] = { ...localDraws[existingIdx], ...normalized };
  } else {
    localDraws.unshift(normalized);
  }
  writeLocalDraws(localDraws);

  // Attempt MongoDB Atlas save
  let storage = 'file_storage';
  try {
    const dbOk = await connectToDatabase();
    if (dbOk) {
      const DrawModel = getDrawModel();
      await DrawModel.findOneAndUpdate(
        { drawId: normalized.drawId },
        normalized,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      storage = 'mongodb';
    }
  } catch (err) {
    console.warn('[DrawStorage] MongoDB save failed, disk file backup confirmed:', err.message);
  }

  return {
    success: true,
    draw: normalized,
    storage
  };
}

/**
 * Retrieves all saved draws sorted newest first.
 */
export async function getAllDrawRecords() {
  const localDraws = readLocalDraws();

  try {
    const dbOk = await connectToDatabase();
    if (dbOk) {
      const DrawModel = getDrawModel();
      const mongoDocs = (await DrawModel.find({}).sort({ createdAt: -1 }).lean()) || [];
      // Merge any local draws not yet synced to MongoDB
      const seenIds = new Set(mongoDocs.map((d) => d.drawId));
      const merged = [...mongoDocs];
      localDraws.forEach((ld) => {
        if (!seenIds.has(ld.drawId)) {
          merged.push(ld);
        }
      });
      return {
        draws: merged,
        storage: 'mongodb'
      };
    }
  } catch (err) {
    console.warn('[DrawStorage] MongoDB query failed, using local backup:', err.message);
  }

  return {
    draws: localDraws,
    storage: 'file_storage'
  };
}

/**
 * Retrieves a single draw by drawId.
 */
export async function getDrawRecordById(drawId) {
  if (!drawId) return null;

  try {
    const dbOk = await connectToDatabase();
    if (dbOk) {
      const DrawModel = getDrawModel();
      const doc = await DrawModel.findOne({ drawId }).lean();
      if (doc) {
        return { draw: doc, storage: 'mongodb' };
      }
    }
  } catch (err) {
    console.warn('[DrawStorage] MongoDB find failed, checking local backup:', err.message);
  }

  const localDraws = readLocalDraws();
  const match = localDraws.find((d) => d.drawId === drawId);
  if (match) {
    return { draw: match, storage: 'file_storage' };
  }

  return null;
}

/**
 * Updates reveal state for an active draw.
 */
export async function updateDrawRecord(drawId, updates) {
  if (!drawId) throw new Error('Draw ID is required');

  // Update local file
  const localDraws = readLocalDraws();
  const idx = localDraws.findIndex((d) => d.drawId === drawId);
  if (idx >= 0) {
    localDraws[idx] = { ...localDraws[idx], ...updates };
    writeLocalDraws(localDraws);
  }

  // Update MongoDB
  try {
    const dbOk = await connectToDatabase();
    if (dbOk) {
      const DrawModel = getDrawModel();
      await DrawModel.findOneAndUpdate({ drawId }, { $set: updates });
    }
  } catch (err) {
    console.warn('[DrawStorage] MongoDB update failed:', err.message);
  }

  return { success: true };
}
