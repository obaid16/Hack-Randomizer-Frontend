import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI =
  'mongodb://ubaid:Ubaid2310@ac-osvmkej-shard-00-00.qgde3ni.mongodb.net:27017,ac-osvmkej-shard-00-01.qgde3ni.mongodb.net:27017,ac-osvmkej-shard-00-02.qgde3ni.mongodb.net:27017/?ssl=true&replicaSet=atlas-12823l-shard-0&authSource=admin';

const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const res = await db.collection('eventdraws').deleteMany({ eventId: { $ne: 'evt_hackathon_2027' } });
  console.log('Cleaned orphan eventdraws:', res.deletedCount);
  await mongoose.disconnect();
}
run();
