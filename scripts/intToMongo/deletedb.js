// delete_all_documents.js

// 1. Install dependencies:
//    npm install mongodb dotenv

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenInterhomeDB?retryWrites=true&w=majority&appName=ClusterWork"
  ;
  if (!uri) {
    console.error('⚠️  Please set MONGO_URI in your environment or .env file.');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    // The DB name is taken from the URI; MongoClient.db() with no args uses it.
    const db = client.db();

    // List all collections
    const cols = await db.listCollections().toArray();
    if (cols.length === 0) {
      console.log('No collections found – nothing to delete.');
      return;
    }

    // Delete all documents from each collection
    for (const { name } of cols) {
      const result = await db.collection(name).deleteMany({});
      console.log(`✔ Cleared ${result.deletedCount} docs from "${name}"`);
    }

    console.log('✅ All documents deleted.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

run();
