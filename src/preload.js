const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widget', {
  togglePin: () => ipcRenderer.invoke('toggle-pin'),
  hide: () => ipcRenderer.send('hide-window'),
  onWakeUp: (callback) => ipcRenderer.on('wake-up', callback),
  onPinChanged: (callback) => ipcRenderer.on('pin-changed', (_event, pinned) => callback(pinned))
});
