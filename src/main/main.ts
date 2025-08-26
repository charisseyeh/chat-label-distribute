const { app, BrowserWindow } = require('electron');
const path = require('path');
const { IPCHandlers } = require('./ipc-handlers');

let mainWindow = null;

function createWindow() {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
  });

  // Try to find the correct port for the renderer
  const rendererPort = 3000; // Vite is running on port 3000
  const rendererURL = `http://localhost:${rendererPort}`;
  
  console.log(`Loading renderer from: ${rendererURL}`);
  console.log(`Preload script path: ${path.join(__dirname, '../preload/preload.js')}`);
  
  // Load from Vite dev server
  mainWindow.loadURL(rendererURL);
  
  // Open DevTools in development
  mainWindow.webContents.openDevTools();
  
  // Log when the page is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer page loaded successfully');
  });
  
  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event: any, errorCode: number, errorDescription: string) => {
    console.error('Failed to load renderer:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  console.log('App is ready, initializing...');
  
  try {
    // Initialize IPC handlers
    console.log('Initializing IPC handlers...');
    new IPCHandlers();
    console.log('IPC handlers initialized successfully');
    
    createWindow();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
