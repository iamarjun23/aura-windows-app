const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let splash;
let mainWindow;

function createSplash() {
  splash = new BrowserWindow({
    fullscreen: true,
    frame: true, // shows title bar and window controls
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });


  splash.loadFile(path.join(__dirname, 'src', 'splash.html'));

  splash.on('closed', () => {
    splash = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'login.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createSplash();
});

// Splash tells main to show login
ipcMain.on('navigate-to-login', () => {
  if (splash) {
    splash.close();
  }
  createMainWindow();
});

// Login page tells main to show aura home page
ipcMain.on('login-success', () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'auraHome.html'));
  }
});

// Load Aura Addons main page
ipcMain.on('load-auraaddons', () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'auraaddons.html'));
  }
});

// Load Addon feature pages safely by checking file existence
ipcMain.on('navigate-to-addon', (event, targetFile) => {
  if (!mainWindow) return;

  if (typeof targetFile !== 'string' || targetFile.trim() === '') {
    console.error('Invalid target file:', targetFile);
    return;
  }
  
  const fileToLoad = path.join(__dirname, 'src', 'features', targetFile);
  
  if (!fs.existsSync(fileToLoad)) {
    console.error('File does not exist:', fileToLoad);
    return;
  }
  
  mainWindow.loadFile(fileToLoad);
});

app.on('window-all-closed', () => {
  app.quit();
});
