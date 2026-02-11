
import { Dexie, type Table } from 'dexie';
import { Member, StoreItem, LevelConfig, GlobalSettings } from '../types';

// Defining the database class extending Dexie
export class DreamQuestDB extends Dexie {
  members!: Table<Member>;
  storeItems!: Table<StoreItem>;
  levelConfigs!: Table<LevelConfig>;
  globalSettings!: Table<GlobalSettings>;

  constructor() {
    super('DreamQuestDB');
    // Using this.version to define the schema
    this.version(2).stores({
      members: 'id, name, role, updatedAt',
      storeItems: 'id, title, updatedAt',
      levelConfigs: 'level_number, updatedAt',
      globalSettings: 'id, updatedAt'
    });
  }
}

export const db = new DreamQuestDB();

// Helpers para acesso rápido local
export const getLocalMembers = () => db.members.toArray();
export const saveLocalMember = (member: Member) => db.members.put({ ...member, updatedAt: Date.now() });
export const getLocalStoreItems = () => db.storeItems.toArray();
export const saveLocalStoreItem = (item: StoreItem) => db.storeItems.put({ ...item, updatedAt: Date.now() });
