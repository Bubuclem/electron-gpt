/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
const chatFooter = document.getElementById('footer-component');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatList = document.getElementById('chat-list');

let conversationId = null;

function addFooterToPage() {
  const footerContainer = document.createElement("div");
  const footerHTML = window.createFooterComponent();
  footerContainer.innerHTML = footerHTML;
  chatFooter.appendChild(footerContainer);
}

document.addEventListener("footerComponentReady", () => {
  addFooterToPage();
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addMessageToList(userMessage, 'user');

  chatInput.value = '';

  try {
    if (conversationId === null) {
      conversationId = await window.electron.getNewConversationId();
    }

    const response = await window.electron.generateText(userMessage, conversationId);
    const { markdownMessageHistory, conversationId: newConversationId } = response;

    console.log('assistantMessage:', markdownMessageHistory);

    if (conversationId === null) {
      conversationId = newConversationId;
    }

    addMessageToList(markdownMessageHistory, "assistant");
  } catch (error) {
    console.error('Erreur lors de la generation du texte:', error);
  }
});

function addMessageToList(message, role) {
  const liElement = document.createElement('li');
  liElement.classList.add('prose', 'lg:prose-xl', 'border-b', 'border-gray-200');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = message;
  messageElement.classList.add(role, 'text-slate-600', 'dark:text-slate-100');

  chatList.appendChild(liElement);
  liElement.appendChild(messageElement);
}