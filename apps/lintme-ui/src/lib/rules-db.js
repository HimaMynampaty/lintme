import { nanoid } from 'nanoid';
import { openDB } from 'idb';

export const dbPromise = openDB('lintmerules', 1, {
  upgrade(db) {
    const store = db.createObjectStore('rules', { keyPath: 'id' });
    store.createIndex('name', 'name');
  }
});

 export async function saveRule(name, yaml) {
   const db  = await dbPromise;
   const tx  = db.transaction('rules', 'readwrite');
   const idx = tx.store.index('name');
   const prev = await idx.getAll(name);  
    if (prev.length >= 3) {
    prev.sort((a, b) => a.version - b.version)
        .slice(0, prev.length - 2)
        .forEach(p => tx.store.delete(p.id));
  }
  const next = {
    id: nanoid(10),
    name,
    yaml,
    ts: Date.now(),
    version: (prev.at(-1)?.version ?? 0) + 1
  };
  await db.add('rules', next);
  return next;
}

export async function allRules() {
  return (await dbPromise).getAll('rules');
 }

export async function loadRule(id) {
  return (await dbPromise).get('rules', id);
}

export async function deleteRule(id) {
  return (await dbPromise).delete('rules', id);
}
