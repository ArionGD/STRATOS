/**
 * Stratos Browser Database Engine
 * Powered by Dexie.js (IndexedDB Wrapper)
 * This provides a Django-like relational experience in the browser.
 */
import Dexie from 'dexie';

export const browserDB = new Dexie('StratosArchitectureDB');

// Define the schema: Tables, Primary Keys, and Indexes
// Format: 'tableName': 'primaryKey, index1, index2...'
browserDB.version(2).stores({
  users: '++id, username, email',
  workspaces: 'id, name, user_id',
  clusters: 'id, name, parent_id, workspace_id',
  notes: 'id, title, parent_id, workspace_id',
  conversations: 'id, workspace_id, user_id, workspace_name, title, messages_json, updated_at'
});

console.log('🏛️ Stratos Browser DB Initialized with Simplified Schema (v2)');
