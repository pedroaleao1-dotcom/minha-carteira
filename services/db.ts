
import Dexie, { type Table } from 'dexie';
import { Member, StoreItem } from '../types';

// Fix: Use default import for Dexie to ensure 'version' and other base methods are correctly recognized during inheritance
export class DreamQuestDB extends Dexie {
  members!: Table<Member>;
  storeItems!: Table<StoreItem>;

  constructor() {
    super('DreamQuestDB');
    // version() is a method inherited from the Dexie base class used to define the schema
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
