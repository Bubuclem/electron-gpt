/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  generateText: async (prompt, conversationId) => {
    return await ipcRenderer.invoke('generate-text', prompt, conversationId);
  },

  getNewConversationId: async () => {
    return await ipcRenderer.invoke('getNewConversationId');
  }
});