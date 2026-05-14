/**
 * Stratos Note Service
 * Automatically handles storage between Desktop (SQLite) and Browser (LocalStorage)
 */

const isTauri = !!window.__TAURI_INTERNALS__;

export const NoteService = {
  // Save a note (Draft)
  saveNote: async (note) => {
    if (isTauri) {
      try {
        const { invoke } = window.__TAURI_INTERNALS__.core;
        return await invoke('save_note', { note }); // We'll implement this in Rust later
      } catch (err) {
        console.error('Tauri Save Error:', err);
      }
    } else {
      // Browser Mock Logic
      const notes = JSON.parse(localStorage.getItem('stratos_notes') || '[]');
      const index = notes.findIndex(n => n.id === note.id);
      
      if (index >= 0) {
        notes[index] = { ...note, updatedAt: new Date().toISOString() };
      } else {
        notes.push({ ...note, id: Date.now().toString(), createdAt: new Date().toISOString() });
      }
      
      localStorage.setItem('stratos_notes', JSON.stringify(notes));
      console.log('📝 Note Saved to Browser DB:', note);
      return { success: true, note };
    }
  },

  // Get all notes
  getNotes: async () => {
    if (isTauri) {
      // Will pull from SQLite
      return []; 
    } else {
      return JSON.parse(localStorage.getItem('stratos_notes') || '[]');
    }
  }
};
