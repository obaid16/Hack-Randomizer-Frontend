import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI =
  'mongodb://ubaid:Ubaid2310@ac-osvmkej-shard-00-00.qgde3ni.mongodb.net:27017,ac-osvmkej-shard-00-01.qgde3ni.mongodb.net:27017,ac-osvmkej-shard-00-02.qgde3ni.mongodb.net:27017/?ssl=true&replicaSet=atlas-12823l-shard-0&authSource=admin';

const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  const eventsCol = db.collection('managedevents');
  const allEvents = await eventsCol.find({}, { projection: { eventId: 1, name: 1, status: 1 } }).toArray();
  console.log(`Found ${allEvents.length} events:`);
  for (const e of allEvents) {
    console.log(` - ${e.eventId}: "${e.name}" (${e.status})`);
  }

  // Delete demo/test events
  // Demo/test events include:
  // - Event A, Event B, test, test (Copy), evt_event_a_*, evt_event_b_*
  const demoQuery = {
    $or: [
      { name: { $regex: /robotics cup/i } },
      { name: { $regex: /web3 hack/i } },
      { name: { $regex: /^test/i } },
      { eventId: { $regex: /^evt_event_[ab]/i } }
    ]
  };

  const deleteResult = await eventsCol.deleteMany(demoQuery);
  console.log(`Deleted ${deleteResult.deletedCount} demo events.`);

  const remaining = await eventsCol.find({}, { projection: { eventId: 1, name: 1, status: 1 } }).toArray();
  console.log(`Remaining ${remaining.length} events:`);
  for (const e of remaining) {
    console.log(` - ${e.eventId}: "${e.name}" (${e.status})`);
  }

  // Also clean up draw collections if any test draws exist
  if (collections.some(c => c.name === 'draws')) {
    const drawsCol = db.collection('draws');
    const drawsCount = await drawsCol.countDocuments();
    console.log(`Draws collection has ${drawsCount} draws.`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
