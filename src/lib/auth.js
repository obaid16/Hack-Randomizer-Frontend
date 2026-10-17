import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon-randomizer-production-jwt-key-2027-sec';

let cachedConnection = global.mongoose;
if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

const DEFAULT_MONGODB_URI =
  'mongodb://ubaid:Ubaid2310@ac-osvmkej-shard-00-00.qgde3ni.mongodb.net:27017,ac-osvmkej-shard-00-01.qgde3ni.mongodb.net:27017,ac-osvmkej-shard-00-02.qgde3ni.mongodb.net:27017/?ssl=true&replicaSet=atlas-12823l-shard-0&authSource=admin';

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    DEFAULT_MONGODB_URI
  );
}

async function getDb() {
  const uri = getMongoUri();

  if (cachedConnection.conn && mongoose.connection.readyState === 1) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    cachedConnection.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
  }

  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}

export function signAdminToken(admin) {
  return jwt.sign(
    {
      id: admin._id ? admin._id.toString() : admin.id,
      email: admin.email,
      name: admin.name || 'Admin',
      role: admin.role || 'ADMIN'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Authenticates admin against MongoDB Atlas without exposing credentials.
 */
export async function authenticateAdmin(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  await getDb();
  const adminCol = mongoose.connection.db.collection('admins');
  const admin = await adminCol.findOne({ email: email.toLowerCase().trim() });

  if (!admin || !admin.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = signAdminToken(admin);

  return {
    admin: {
      email: admin.email,
      name: admin.name,
      role: admin.role
    },
    token
  };
}

/**
 * Verifies admin session from Next.js Request cookies or Authorization header.
 */
export async function verifyAdminRequest(request) {
  let token = null;

  // 1. Check HttpOnly cookie
  if (request.cookies) {
    const cookieToken = request.cookies.get('auth_token')?.value;
    if (cookieToken) token = cookieToken;
  }

  // 2. Check Authorization Bearer header
  if (!token && request.headers) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    throw new Error('Authentication required. Please log in as an administrator.');
  }

  const decoded = verifyAdminToken(token);
  if (!decoded) {
    throw new Error('Session expired or invalid. Please log in again.');
  }

  return decoded;
}
