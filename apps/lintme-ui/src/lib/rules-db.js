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
   const existing = (await idx.getAll(name))[0];
    const next = {
      id: existing?.id ?? nanoid(10),
      name,
      yaml,
      ts: Date.now()
    };

    await tx.store.put(next);
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
