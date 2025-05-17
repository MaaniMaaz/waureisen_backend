const mongoose = require('mongoose');
const Filter = require('../../../../models/filter.model');

const MONGO_URI = 'mongodb+srv://i222469:m4Z9wJXYK7q3adCL@clusterwork.mtqds1t.mongodb.net/waureisenDB2025CHECK?retryWrites=true&w=majority&appName=ClusterWork';

const NAME_MAP = {
  'Fenced Garden 1': 'Fenced Garden 100 cm',
  'Fenced Garden 2': 'Fenced Garden 200 cm',
  'Fenced Garden 150': 'Fenced Garden 150 cm',
};

function updateFilterNames(filters) {
  let changed = false;
  if (!Array.isArray(filters)) return false;
  for (const filter of filters) {
    if (NAME_MAP[filter.name]) {
      filter.name = NAME_MAP[filter.name];
      changed = true;
    }
  }
  return changed;
}

async function updateFencedGardenNames() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const filters = await Filter.find({ isTemplate: false });
    let totalChanged = 0;

    for (const doc of filters) {
      let changed = false;
      if (Array.isArray(doc.subsections)) {
        for (const subsection of doc.subsections) {
          // Update filters directly under subsection
          if (updateFilterNames(subsection.filters)) changed = true;
          // Update filters in subsubsections
          if (Array.isArray(subsection.subsubsections)) {
            for (const subsub of subsection.subsubsections) {
              if (updateFilterNames(subsub.filters)) changed = true;
            }
          }
        }
      }
      if (changed) {
        await doc.save();
        totalChanged++;
        console.log(`Updated Filter _id: ${doc._id}`);
      }
    }
    console.log(`Done. Updated ${totalChanged} Filter documents.`);
  } catch (error) {
    console.error('Error updating filter names:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateFencedGardenNames(); 