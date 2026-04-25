const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openExternal: (url) => require('electron').shell.openExternal(url),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  printToPDF: (opts) => ipcRenderer.invoke('print-to-pdf', opts),
});