import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import * as path from 'path';
import { IPCHandlers } from './ipc-handlers';

// Set the app name immediately after import
app.setName('Self-labeler');

// Try setting the app name in the process
process.title = 'Self-labeler';

// Also try setting the app name in the process environment
process.env.ELECTRON_APP_NAME = 'Self-labeler';

// Also try setting the app user model ID for Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.selflabeler.app');
}

// Define icon path - use PNG for development, ICNS for production
const iconPath = process.env.NODE_ENV === 'development'
  ? path.join(process.cwd(), 'assets/icons/icon.png')
  : (process.platform === 'darwin' 
    ? path.join(process.cwd(), 'assets/icons/icon.icns')
    : path.join(process.cwd(), 'assets/icons/icon.png'));

// Set the app icon and name for macOS
if (process.platform === 'darwin') {
  if (require('fs').existsSync(iconPath)) {
    app.dock.setIcon(iconPath);
  }
  // Force the dock to update the app name
  app.dock.setBadge('');
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create native image from icon
  const iconImage = nativeImage.createFromPath(iconPath);
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: iconImage,
    title: 'Self-labeler',
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      webSecurity: true
    }
  });

  // Force the app name to be set on the window
  mainWindow.setTitle('Self-labeler');
  
  // Also try setting the app name on the app itself
  if (process.platform === 'darwin') {
    app.dock.setBadge('');
  }
  
  // Force the window to update its title
  mainWindow.on('ready-to-show', () => {
    mainWindow?.setTitle('Self-labeler');
  });
 
  // Show the window once it's ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Set Content Security Policy headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: blob:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' ws: wss:;"
        ]
      }
    });
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

app.whenReady().then(() => {
  createWindow();
  try {
    const ipcHandlers = new IPCHandlers();
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
