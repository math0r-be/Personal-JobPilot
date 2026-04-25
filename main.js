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
    let resolved = false;

    const server = spawn('node', [serverPath], {
      env: { ...process.env, PORT: '3000' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server:', output);
      if (!resolved && (output.includes('Ready') || output.includes('3000'))) {
        resolved = true;
        clearTimeout(timeout);
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    server.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    server.on('exit', (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log('Server startup timeout — resolving anyway');
        resolve(server);
      }
    }, 5000);
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

  ipcMain.handle('print-to-pdf', async (event, { cvId, templateId, title }) => {
    const PRINT_TIMEOUT_MS = 30_000;
    return new Promise((resolve, reject) => {
      let resolved = false;

      const printWindow = new BrowserWindow({
        width: 794,
        height: 1123,
        show: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

      const baseUrl = isDev ? 'http://localhost:3000' : 'http://localhost:3000';
      const printUrl = `${baseUrl}/api/cvs/${cvId}/preview?t=${templateId}&print=1`;

      const printTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          printWindow.close();
          reject(new Error('Print preview timed out after 30 seconds'));
        }
      }, PRINT_TIMEOUT_MS);

      printWindow.loadURL(printUrl);

      printWindow.webContents.on('did-finish-load', async () => {
        if (resolved) return;
        try {
          const pdfData = await printWindow.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
          });

          const { filePath } = await require('electron').dialog.showSaveDialog({
            defaultPath: `${(title || 'CV').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            filters: [{ name: 'PDF', extensions: ['pdf'] }],
          });

          if (filePath) {
            fs.writeFileSync(filePath, pdfData);
            resolved = true;
            clearTimeout(printTimeout);
            printWindow.close();
            resolve({ success: true, path: filePath });
          } else {
            resolved = true;
            clearTimeout(printTimeout);
            printWindow.close();
            resolve({ success: false, cancelled: true });
          }
        } catch (err) {
          resolved = true;
          clearTimeout(printTimeout);
          printWindow.close();
          reject(err);
        }
      });

      printWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(printTimeout);
          printWindow.close();
          reject(new Error(`Load failed: ${errorDescription} (${errorCode})`));
        }
      });
    });
  });

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