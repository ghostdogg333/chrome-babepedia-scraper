// IndexedDB with Dexie.js for easier handling
const db = new Dexie('myDB');
db.version(1).stores({
  settings: 'id, apiKey, theme'
});

async function saveSettings(settings) {
  await db.settings.put(settings);
}

async function getSettings(id) {
  return await db.settings.get(id);
}
