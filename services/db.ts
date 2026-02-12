
import Dexie, { type Table } from 'dexie';
import { Member, StoreItem, LevelConfig, GlobalSettings, JourneyTemplate } from '../types';

// Use default import for Dexie to ensure that methods like .version() 
// are correctly inherited and recognized by the TypeScript compiler on the subclass.
export class DreamQuestDB extends Dexie {
  members!: Table<Member, string>;
  storeItems!: Table<StoreItem, string>;
  levelConfigs!: Table<LevelConfig, number>;
  globalSettings!: Table<GlobalSettings, string>;
  journeyTemplates!: Table<JourneyTemplate, string>;

  constructor() {
    super('DreamQuestDB');
    
    // The version() method is inherited from the Dexie base class and is used to define the schema.
    // Using a default import for Dexie typically resolves inheritance-related type errors in TypeScript.
    this.version(3).stores({
      members: 'id, name, role, updatedAt',
      storeItems: 'id, title, updatedAt',
      levelConfigs: 'level_number, updatedAt',
      globalSettings: 'id, updatedAt',
      journeyTemplates: 'id, title, updatedAt'
    });
  }
}

export const db = new DreamQuestDB();
