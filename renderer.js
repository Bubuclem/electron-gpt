const newConversationButton = document.getElementById('new-conversation-button');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatList = document.getElementById('chat-list');

let conversationId = null;

// Liste des fonctions
async function addMessageToList(message, role) {
  const liElement = document.createElement('li');
  liElement.classList.add('border-b', 'border-gray-200');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = await window.electron.renderMarkdown(message.content);
  messageElement.classList.add(role, 'text-slate-600', 'dark:text-slate-100');

  chatList.appendChild(liElement);
  liElement.appendChild(messageElement);

  const lastMessage = chatList.lastElementChild;
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
}

function createConversationListItem(conversation) {
  const listItem = document.createElement('li');
  listItem.innerHTML = `
  <div class="group relative btn btn-ghost btn-block">
    <span class="truncate mr-4">${conversation.id}</span>
    <div class="absolute inset-y-0 right-0 top-1/2 transform -translate-y-1/2">
      <button id="delete-conversation-${conversation.id}" class="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
  `;
  listItem.dataset.conversationId = conversation.id;
  return listItem;
}

async function deleteConversation(conversationId) {
  await window.electron.deleteConversation(conversationId);
  const conversations = await window.electron.getConversations();
  updateConversationsList(conversations);
}

function updateConversationsList(conversations) {
  const listElement = document.querySelector('#conversation-list');
  listElement.innerHTML = '';

  conversations.forEach((conversation) => {
    const listItem = createConversationListItem(conversation);

    listItem.addEventListener('click', async (event) => {
      event.preventDefault();
      const currentConversationId = event.currentTarget.dataset.conversationId;

      const deleteButton = listItem.querySelector(`#delete-conversation-${currentConversationId}`);

      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        deleteConversation(currentConversationId);
      });

      const conversationData = await window.electron.getConversationFromID(currentConversationId);
      const messageHistory = JSON.parse(conversationData.messages);
      chatList.innerHTML = '';

      for (const message of messageHistory) {
        await addMessageToList(message, message.role);
      }

      conversationId = currentConversationId;
      setActiveConversationItem(currentConversationId);
    });

    listElement.appendChild(listItem);
  });
}

function setActiveConversationItem(conversationId) {
  const items = document.querySelectorAll('[data-conversation-id]');
  items.forEach(item => {
    if (item.dataset.conversationId === conversationId) {
      item.firstElementChild.classList.remove('hover:bg-gray-800');
      item.firstElementChild.classList.remove('hover:text-white');
      item.firstElementChild.classList.remove('text-gray-400');
      item.firstElementChild.classList.add('bg-gray-800');
      item.firstElementChild.classList.add('text-white');
    } else {
      item.firstElementChild.classList.remove('bg-gray-800');
      item.firstElementChild.classList.remove('text-white');
      item.firstElementChild.classList.add('text-gray-400');
      item.firstElementChild.classList.add('hover:bg-gray-800');
      item.firstElementChild.classList.add('hover:text-white');
    }
  });
}

function applySettings(settings) {
  const themeSelect = document.getElementById('theme-select');
  const languageSelect = document.getElementById('language-select');
  const modelSelect = document.getElementById('model-select');

  themeSelect.value = settings.theme;
  languageSelect.value = settings.language;
  modelSelect.value = settings.model;
}

function getUpdatedSettings() {
  const themeSelect = document.getElementById('theme-select');
  const languageSelect = document.getElementById('language-select');

  return {
    theme: themeSelect.value,
    language: languageSelect.value,
  };
}

function getUpdatedSettings() {
  const themeSelect = document.getElementById('theme-select');
  const languageSelect = document.getElementById('language-select');

  return {
    theme: themeSelect.value,
    language: languageSelect.value,
  };
}

async function saveSettings() {
  const updatedSettings = getUpdatedSettings();
  try {
    await window.electron.saveSettings(updatedSettings);
  } catch (error) {
    console.error("Error while saving settings:", error);
  }
}

async function loadSettings() {
  try {
    const settings = await window.electron.getSettings();
    applySettings(settings);
  } catch (error) {
    console.error("Error while loading settings:", error);
  }
};

// Gestion des événements

document.addEventListener("DOMContentLoaded", function (event) {
  document.getElementById('popup-modal').click();
});

// newConversationButton.addEventListener('click', async (e) => {
//   e.preventDefault();
//   conversationId = await window.electron.getNewConversationId();

//   chatList.innerHTML = '';
//   chatInput.value = '';

//   addMessageToList({ content: 'Bienvenue dans le chat !\n\nVous pouvez taper votre message et cliquer sur "Envoyer" pour le faire analyser par GPT.' }, 'assistant');
// });

// chatForm.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const userMessage = chatInput.value.trim();
//   if (!userMessage) return;

//   const messageObject = { content: userMessage };

//   addMessageToList(messageObject, 'user');

//   chatInput.value = '';

//   try {
//     if (conversationId === null) {
//       conversationId = await window.electron.getNewConversationId();
//     }

//     const response = await window.electron.generateText(userMessage, conversationId);
//     const { assistantMessage, conversationId: newConversationId } = response;

//     console.log('assistantMessage:', assistantMessage);

//     if (conversationId === null) {
//       conversationId = newConversationId;
//     }

//     const message = { content: assistantMessage };
//     addMessageToList(message, "assistant");
//   } catch (error) {
//     console.error('Erreur lors de la generation du texte:', error);
//   }
// });

// document
//   .getElementById('save-settings')
//   .addEventListener('click', saveSettings);

// Initialisation

(async function () {
  const conversations = await window.electron.getConversations();
  updateConversationsList(conversations);
  loadSettings();
})();