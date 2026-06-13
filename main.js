const { app, shell, BrowserWindow } = require('electron');
const { startServer } = require('./server');

const PORT = process.env.PORT || 3000;

let mainWindow = null;

function openInDefaultBrowser(url) {
  shell.openExternal(url).catch((err) => {
    console.error('No se pudo abrir el navegador predeterminado:', err);
  });
}

app.whenReady().then(async () => {
  // Crear una ventana oculta para mantener vivo el proceso de Electron
  mainWindow = new BrowserWindow({ show: false });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  try {
    await startServer();
    const url = `http://localhost:${PORT}`;
    console.log(`🌐 Abriendo ${url} en el navegador predeterminado...`);
    openInDefaultBrowser(url);
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    app.quit();
    return;
  }
});

// No forzamos `app.quit()` al cerrar ventanas porque usamos una ventana oculta
app.on('window-all-closed', () => {
  // Intencionadamente vacío para mantener el servidor en ejecución
});
