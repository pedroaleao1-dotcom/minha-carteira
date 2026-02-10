
// Fix: Use named import for Dexie to ensure that inheritance and base class methods like 'version' are correctly recognized by the TypeScript compiler.
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { Member, StoreItem } from '../types';

// Inherit from Dexie class using the named import to provide proper typing for 'version' and other methods.
export class DreamQuestDB extends Dexie {
  members!: Table<Member>;
  storeItems!: Table<StoreItem>;

  constructor() {
    super('DreamQuestDB');
    // Defining database version and schema using the inherited version() method.
    this.version(1).stores({
      members: 'id, name, role',
      storeItems: 'id, title'
    });
  }
}

export const db = new DreamQuestDB();

export const saveAllMembers = async (members: Member[]) => {
  await db.members.bulkPut(members);
};

export const saveAllStoreItems = async (items: StoreItem[]) => {
  await db.storeItems.bulkPut(items);
};

export const loadInitialData = async () => {
  const members = await db.members.toArray();
  const storeItems = await db.storeItems.toArray();
  return { members, storeItems };
};
