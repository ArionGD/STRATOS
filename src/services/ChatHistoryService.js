/**
 * Stratos METIS Conversation & Chat History Service
 * Manages full conversation threads (max 3 per workspace, max 20 messages/10 turns per thread)
 * with auto-naming capabilities. Synchronizes between Tauri SQLite and the Stratos web API.
 */
import { invoke } from '@tauri-apps/api/core'
import { WebApi, isTauri } from './WebApi'

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

    if (isTauri) {
      let existingConv = false;
      try {
        const list = await invoke('list_conversations', { workspace_id: params.workspace_id });
        existingConv = (list || []).some(c => c.id === conversationId);
      } catch (err) {
        console.warn('Failed to query existing conversation status:', err);
      }

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
      // WEB MODE: Stratos API (server enforces the 3-thread limit per workspace)
      try {
        await WebApi.put(`/conversations/${encodeURIComponent(conversationId)}`, {
          workspace_id: params.workspace_id,
          workspace_name: params.workspace_name,
          title: params.title,
          messages_json: params.messages_json,
          updated_at: timestamp
        });
        return { success: true };
      } catch (err) {
        if (err.message === 'limit_reached') {
          return { success: false, error: 'limit_reached' };
        }
        console.error('Web Conversation Save Error:', err);
        return { success: false, error: err };
      }
    }
  },

  // Deletes a conversation thread from SQLite or the web API
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
        await WebApi.del(`/conversations/${encodeURIComponent(conversationId)}`);
        return { success: true };
      } catch (err) {
        console.error('Web Conversation Delete Error:', err);
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
      // WEB MODE: Stratos API
      try {
        const convs = await WebApi.get(`/conversations?workspace_id=${encodeURIComponent(workspaceId)}`);

        // Sort by updated_at descending
        convs.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return convs;
      } catch (err) {
        console.error('Failed to fetch conversations from web API:', err);
        return [];
      }
    }
  }
};
