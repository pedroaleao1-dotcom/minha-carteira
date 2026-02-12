
import Dexie, { type Table } from 'dexie';
import { Member, StoreItem, LevelConfig, GlobalSettings } from '../types';

// Defining the database class extending Dexie
export class DreamQuestDB extends Dexie {
  // Use definite assignment assertions for tables
  members!: Table<Member, string>;
  storeItems!: Table<StoreItem, string>;
  levelConfigs!: Table<LevelConfig, number>;
  globalSettings!: Table<GlobalSettings, string>;

  constructor() {
    super('DreamQuestDB');
    
    // Explicitly define the schema versions
    // Define the database schema using this.version(). 
    // Using the default import for Dexie ensures instance methods are correctly recognized in TypeScript.
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
