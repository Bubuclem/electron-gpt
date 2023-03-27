// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const { Configuration, OpenAIApi } = require("openai");

const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const path = require('path')

require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateText(prompt, messageHistory = []) {
  try {
    messageHistory.push({ role: "user", content: prompt });

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant. You speak on French language." },
        ...messageHistory,
      ],
    });

    const assistantMessage = md.render(completion.data.choices[0].message.content);
    messageHistory.push({ role: "assistant", content: assistantMessage });

    // Message history is used to generate the next message
    // console.log("Message history:", JSON.stringify(messageHistory, null, 2));

    return { assistantMessage, messageHistory };
  } catch (error) {
    console.error('Erreur lors de la generation du texte:', error);
    throw error;
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#1e293b',
    //   symbolColor: '#f1f5f9'
    // },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle("generate-text", async (_, prompt, messageHistory) => {
  try {
    const response = await generateText(prompt, messageHistory);
    return response;
  } catch (error) {
    console.error("Erreur lors de la generation du texte:", error);
    throw error;
  }
});