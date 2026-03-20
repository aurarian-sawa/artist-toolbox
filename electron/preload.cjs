const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  downloadAudio: (url, outputDir) => ipcRenderer.invoke('yt:download', url, outputDir),
  saveImage: (arrayBuffer, outputDir, filename) => ipcRenderer.invoke('image:save', arrayBuffer, outputDir, filename)
});
