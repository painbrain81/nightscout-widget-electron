const { contextBridge, ipcRenderer } = require(`electron`);

contextBridge.exposeInMainWorld(`electronAPI`, {
  closeWindow: () => ipcRenderer.send(`close-window`),
  showSettings: () => ipcRenderer.send(`show-settings`),
  getSettings: () => ipcRenderer.invoke(`get-settings`),
  setSettings: (data) => ipcRenderer.send(`set-settings`, data),
  setWidgetOpacity: (opacity) => ipcRenderer.send(`set-widget-opacity`, opacity),
  testAgeVisisblity: (show) => ipcRenderer.send(`test-age-visibility`, show),
  setAgeVisibility: (show) => ipcRenderer.on(`set-age-visibility`, show),
  openNightscout: () => ipcRenderer.send(`open-nightscout`),
  openLogFile: () => ipcRenderer.send(`open-logfile`),
  restart: () => ipcRenderer.send(`restart`),
  logger : {
    info: (msg) => ipcRenderer.send(`log-message`, msg, `info`),
    warn: (msg) => ipcRenderer.send(`log-message`, msg, `warn`),
    error: (msg) => ipcRenderer.send(`log-message`, msg, `error`),
  },
});