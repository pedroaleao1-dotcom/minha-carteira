
// Use default import for Dexie class to ensure that the subclass DreamQuestDB 
// correctly inherits all properties and methods, including 'version'.
import Dexie from 'dexie';
import type { Table } from 'dexie';
import { Member, StoreItem } from '../types';

// Inherit from Dexie class to provide proper typing for 'version' and other methods.
export class DreamQuestDB extends Dexie {
  members!: Table<Member>;
  storeItems!: Table<StoreItem>;

  constructor() {
    super('DreamQuestDB');
    // Defining database version and schema using the inherited version() method.
    // Using the default import ensures 'this.version' is recognized as a valid property.
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
