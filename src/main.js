// main.js - Electron Hauptprozess
const { app, BrowserWindow, session } = require("electron");
const path = require("path");

app.whenReady().then(() => {
  // WebSecurity vollständig deaktivieren
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = 'https://intranet.bib.de';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (!details.responseHeaders['Access-Control-Allow-Origin']) {
      details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    }
    if (!details.responseHeaders['Access-Control-Allow-Headers']) {
      details.responseHeaders['Access-Control-Allow-Headers'] = ['*'];
    }
    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  win.loadFile("index.html");
  win.webContents.openDevTools(); // Für Debugging
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});