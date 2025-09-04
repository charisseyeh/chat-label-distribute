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
    const ipcHandlers = new IPCHandlers();
    
    // Initialize default templates on first run
    try {
      const { AssessmentManager } = await import('./managers/assessment-manager');
      const assessmentManager = new AssessmentManager();
      
      // Use the AssessmentManager's built-in initialization method
      await assessmentManager.initializeDefaultTemplates();
    } catch (error) {
      console.error('Failed to initialize default templates:', error);
    }
  } catch (error) {
    console.error('Failed to initialize IPC handlers:', error);
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
