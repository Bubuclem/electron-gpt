/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatList = document.getElementById('chat-list');

var messageHistory = [];

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addMessageToList(userMessage, 'user');

  chatInput.value = '';

  try {
    const { assistantMessage, messageHistory: updatedMessageHistory } = await window.electron.generateText(userMessage, messageHistory);
    messageHistory = updatedMessageHistory;
    addMessageToList(assistantMessage, "assistant");
  } catch (error) {
    console.error('Erreur lors de la generation du texte:', error);
  }

  console.log("Current message history:", JSON.stringify(messageHistory, null, 2));

});

function addMessageToList(message, role) {
  const messageElement = document.createElement('li');
  messageElement.textContent = message;
  messageElement.classList.add(role, 'border-b', 'border-gray-200');

  chatList.appendChild(messageElement);
}