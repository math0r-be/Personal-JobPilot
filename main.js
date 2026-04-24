const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let nextServer;

function getDatabasePath() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'local.db');
  return dbPath;
}

function copyDatabaseIfNeeded() {
  const dbPath = getDatabasePath();
  const sourceDbPath = isDev
    ? path.join(__dirname, 'prisma', 'local.db')
    : path.join(process.resourcesPath, 'prisma', 'local.db');

  if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
    const sourceDir = path.dirname(dbPath);
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
    }
    fs.copyFileSync(sourceDbPath, dbPath);
  }
}

async function startNextServer() {
  const standalonePath = path.join(__dirname, '.next', 'standalone');

  if (!fs.existsSync(standalonePath)) {
    console.log('Standalone build not found, running in dev mode');
    return null;
  }

  const dbPath = getDatabasePath();
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  process.env.DATABASE_URL = `file:${dbPath}`;

  const serverPath = path.join(standalonePath, 'server.js');
  console.log('Starting standalone server with DATABASE_URL:', process.env.DATABASE_URL);

  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      env: { ...process.env, PORT: '3000' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server:', output);
      if (output.includes('Ready') || output.includes('3000')) {
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    server.on('error', reject);

    server.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    setTimeout(() => resolve(server), 5000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'public', 'icon.ico'),
  });

  mainWindow.loadURL('http://localhost:3000');

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
}

app.whenReady().then(async () => {
  ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    userDataPath: app.getPath('userData'),
  }));

  copyDatabaseIfNeeded();

  if (!isDev) {
    nextServer = await startNextServer();
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});