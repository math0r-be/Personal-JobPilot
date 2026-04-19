const { contextBridge, app } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openExternal: (url) => require('electron').shell.openExternal(url),
  getAppVersion: () => app.getVersion(),
  getUserDataPath: () => app.getPath('userData'),
});