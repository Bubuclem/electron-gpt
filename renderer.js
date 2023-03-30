/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
const newConversationButton = document.getElementById('new-conversation-button');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatList = document.getElementById('chat-list');

let conversationId = null;

newConversationButton.addEventListener('click', async (e) => {
  e.preventDefault();
  conversationId = await window.electron.getNewConversationId();

  chatList.innerHTML = '';
  chatInput.value = '';

  addMessageToList({ content: 'Bienvenue dans le chat !\n\nVous pouvez taper votre message et cliquer sur "Envoyer" pour le faire analyser par GPT.' }, 'assistant');
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  const messageObject = { content: userMessage };

  addMessageToList(messageObject, 'user');

  chatInput.value = '';

  try {
    if (conversationId === null) {
      conversationId = await window.electron.getNewConversationId();
    }

    const response = await window.electron.generateText(userMessage, conversationId);
    const { assistantMessage, conversationId: newConversationId } = response;

    console.log('assistantMessage:', assistantMessage);

    if (conversationId === null) {
      conversationId = newConversationId;
    }

    const message = { content: assistantMessage };
    addMessageToList(message, "assistant");
  } catch (error) {
    console.error('Erreur lors de la generation du texte:', error);
  }
});

async function addMessageToList(message, role) {
  const liElement = document.createElement('li');
  liElement.classList.add('prose', 'lg:prose-xl', 'border-b', 'border-gray-200');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = await window.electron.renderMarkdown(message.content);
  messageElement.classList.add(role, 'text-slate-600', 'dark:text-slate-100');

  chatList.appendChild(liElement);
  liElement.appendChild(messageElement);
}

function createConversationListItem(conversation) {
  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <a href="#" class="text-gray-400 hover:text-white hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
      <span class="truncate">${conversation.id}</span>
    </a>
  `;
  listItem.dataset.conversationId = conversation.id;
  return listItem;
}

function updateConversationsList(conversations) {
  const listElement = document.querySelector('#conversation-list');
  listElement.innerHTML = '';

  conversations.forEach((conversation) => {
    const listItem = createConversationListItem(conversation);

    listItem.addEventListener('click', async (event) => {
      event.preventDefault();
      const currentConversationId = event.currentTarget.dataset.conversationId;

      const conversationData = await window.electron.getConversationFromID(currentConversationId);
      const messageHistory = JSON.parse(conversationData.messages);
      chatList.innerHTML = '';

      for (const message of messageHistory) {
        await addMessageToList(message, message.role);
      }

      conversationId = currentConversationId;
    });

    listElement.appendChild(listItem);
  });
}

function onConversationItemClick(event) {
  const conversationId = event.currentTarget.dataset.conversationId;
  currentConversationId = conversationId;
}

(async function () {
  const conversations = await window.electron.getConversations();
  updateConversationsList(conversations);
})();