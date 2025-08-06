const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let splash;
let mainWindow;

function createSplash() {
  splash = new BrowserWindow({
    width: 1280,               // initial width before maximize
    height: 720,               // initial height before maximize
    minWidth: 800,
    maxWidth: 1920,
    minHeight: 600,
    maxHeight: 1080,
    frame: true,               // show native OS window frame with controls
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,              // hide until ready to show and maximize
  });

  splash.loadFile(path.join(__dirname, 'src', 'splash.html'));

  splash.once('ready-to-show', () => {
    splash.maximize();
    splash.show();
  });

  splash.on('closed', () => {
    splash = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    maxWidth: 1920,
    minHeight: 600,
    maxHeight: 1080,
    frame: true,
    resizable: true,
    show: false, // hide until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'login.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();  // maximize main window to fill screen area
    mainWindow.show();

    // Close splash once main window is shown
    if (splash) {
      splash.close();
      splash = null;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createSplash();
});

// Listen for splash renderer requesting to show main window
ipcMain.on('navigate-to-login', () => {
  if (!mainWindow) {
    createMainWindow();
  }
  // Splash stays open until main window ready and shown
});

// Handle login page success to load home
ipcMain.on('login-success', () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'auraHome.html'));
  }
});

// Load extras page
ipcMain.on('load-auraaddons', () => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'auraaddons.html'));
  }
});

// Safe load addon feature pages
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
