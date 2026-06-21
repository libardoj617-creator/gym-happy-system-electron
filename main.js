const { app, BrowserWindow, dialog } = require('electron');
const { startServer } = require('./server');

const PORT = process.env.PORT || 3000;

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

app.whenReady().then(async () => {
  try {
    const window = createMainWindow();
    await startServer();
    const url = `http://localhost:${PORT}`;
    console.log(`🌐 Cargando ${url} en la ventana de Electron...`);
    await window.loadURL(url);
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    await dialog.showMessageBox({
      type: 'error',
      title: 'Servidor no disponible',
      message: 'No se pudo iniciar el servidor local.',
      detail: error?.message || String(error),
    });
    app.quit();
    return;
  }
});

// No forzamos `app.quit()` al cerrar ventanas porque usamos una ventana oculta
app.on('window-all-closed', () => {
  // Intencionadamente vacío para mantener el servidor en ejecución
});
