
import { Dexie, type Table } from 'dexie';
import { Member, StoreItem, LevelConfig, GlobalSettings, JourneyTemplate } from '../types';

// Fix: Changed default import to named import { Dexie } to ensure that the class definition 
// and its methods like .version() are correctly inherited and recognized by TypeScript on the subclass.
export class DreamQuestDB extends Dexie {
  members!: Table<Member, string>;
  storeItems!: Table<StoreItem, string>;
  levelConfigs!: Table<LevelConfig, number>;
  globalSettings!: Table<GlobalSettings, string>;
  journeyTemplates!: Table<JourneyTemplate, string>;

  constructor() {
    super('DreamQuestDB');
    
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
