/**
 * Stratos METIS Conversation & Chat History Service
 * Manages full conversation threads (max 3 per workspace, max 20 messages/10 turns per thread)
 * with auto-naming capabilities. Synchronizes between Tauri SQLite and Browser Dexie DB.
 */
import { invoke } from '@tauri-apps/api/core'
import { browserDB } from './BrowserDB'

const isTauri = !!window.__TAURI_INTERNALS__;

export const ChatHistoryService = {
  // Saves or updates a conversation thread with its full array of messages
  saveConversation: async ({ 
    workspaceId, 
    userId, 
    workspaceName, 
    conversationId, 
    title, 
    messages 
  }) => {
    const timestamp = new Date().toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Enforce message limit inside this conversation: Keep latest 20 messages (10 Q&A turns)
    const prunedMessages = (messages || []).slice(-20);
    const messagesJson = JSON.stringify(prunedMessages);

    const params = {
      workspace_id: workspaceId || 'default_ws',
      user_id: parseInt(userId) || 1,
      workspace_name: workspaceName || 'Default Workspace',
      conversation_id: conversationId,
      title: title || 'New Conversation',
      messages_json: messagesJson,
      updated_at: timestamp
    };

    let existingConv = false;
    try {
      if (isTauri) {
        const list = await invoke('list_conversations', { workspace_id: params.workspace_id });
        existingConv = (list || []).some(c => c.id === conversationId);
      } else {
        const item = await browserDB.conversations.get(conversationId);
        existingConv = !!item;
      }
    } catch (err) {
      console.warn('Failed to query existing conversation status:', err);
    }

    if (isTauri) {
      try {
        // Enforce 3 conversations limit before adding new one in SQLite
        if (!existingConv) {
          const list = await invoke('list_conversations', { workspace_id: params.workspace_id });
          if (list && list.length >= 3) {
            return { success: false, error: 'limit_reached' };
          }
        }
        const result = await invoke('save_conversation', params);
        console.log('🤖 METIS Thread Synced to SQLite Backend:', result);
        return { success: true };
      } catch (err) {
        console.error('Tauri SQLite Conversation Save Error:', err);
        return { success: false, error: err };
      }
    } else {
      // BROWSER MODE: Sync via Dexie IndexedDB
      try {
        if (!existingConv) {
          // Enforce 3 conversations limit before adding new one
          const workspaceConvs = await browserDB.conversations
            .where('workspace_id')
            .equals(params.workspace_id)
            .toArray();

          if (workspaceConvs.length >= 3) {
            return { success: false, error: 'limit_reached' };
          }

          // Insert new conversation thread
          await browserDB.conversations.add({
            id: conversationId,
            workspace_id: params.workspace_id,
            user_id: params.user_id,
            workspace_name: params.workspace_name,
            title: params.title,
            messages_json: params.messages_json,
            updated_at: timestamp
          });
        } else {
          // Update conversation
          await browserDB.conversations.update(conversationId, { 
            title: params.title,
            messages_json: params.messages_json,
            updated_at: timestamp 
          });
        }

        console.log('🤖 METIS Thread Synced to Browser IndexedDB (Max 3 Threads & Max 20 Messages Enforced)');
        return { success: true };
      } catch (err) {
        console.error('Browser Dexie Conversation Save Error:', err);
        return { success: false, error: err };
      }
    }
  },

  // Deletes a conversation thread from SQLite and Dexie
  deleteConversation: async (conversationId) => {
    if (isTauri) {
      try {
        const result = await invoke('delete_conversation', { conversation_id: conversationId });
        console.log('🗑️ METIS Conversation Deleted from SQLite:', result);
        return { success: true };
      } catch (err) {
        console.error('Tauri SQLite Delete Error:', err);
        return { success: false, error: err };
      }
    } else {
      try {
        await browserDB.conversations.delete(conversationId);
        console.log('🗑️ METIS Conversation Deleted from IndexedDB');
        return { success: true };
      } catch (err) {
        console.error('Browser Dexie Delete Error:', err);
        return { success: false, error: err };
      }
    }
  },

  // Retrieves all conversation threads for a specific workspace (sorted newest updated first, max 3)
  listConversations: async (workspaceId) => {
    if (isTauri) {
      try {
        const convList = await invoke('list_conversations', { workspace_id: workspaceId });
        return convList || [];
      } catch (err) {
        console.error('Failed to list conversations from SQLite:', err);
        return [];
      }
    } else {
      // BROWSER MODE: Fetch from Dexie IndexedDB
      try {
        const convs = await browserDB.conversations
          .where('workspace_id')
          .equals(workspaceId)
          .toArray();

        // Sort by updated_at descending
        convs.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return convs;
      } catch (err) {
        console.error('Failed to fetch conversations from IndexedDB:', err);
        return [];
      }
    }
  }
};
