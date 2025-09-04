import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { IPCHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });

  // Load the renderer
  const rendererURL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(rendererURL);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(async () => {
  createWindow();
  try {
    console.log('🚀 Initializing IPC handlers...');
    const ipcHandlers = new IPCHandlers();
    console.log('✅ IPC handlers initialized successfully');
    
    // Initialize default templates on first run
    console.log('🔍 Checking for first run and initializing default templates...');
    try {
      const { AssessmentManager } = await import('./managers/assessment-manager');
      const assessmentManager = new AssessmentManager();
      const initialized = await assessmentManager.initializeDefaultTemplates();
      if (initialized) {
        console.log('🎉 Default templates initialized successfully');
      } else {
        console.log('ℹ️ Default templates already exist or initialization not needed');
      }
    } catch (error) {
      console.error('❌ Failed to initialize default templates:', error);
    }
  } catch (error) {
    console.error('❌ Failed to initialize IPC handlers:', error);
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
