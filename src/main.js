const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, screen } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

let mainWindow;
let tray;
let isQuitting = false;
let pinned = true;
const headlessTest = process.env.MIMI_HEADLESS_TEST === '1';

const defaultBounds = { width: 360, height: 300 };

function stateFile() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function readWindowState() {
  try {
    return { ...defaultBounds, ...JSON.parse(fs.readFileSync(stateFile(), 'utf8')) };
  } catch {
    return defaultBounds;
  }
}

function isVisibleOnAnyDisplay(bounds) {
  return screen.getAllDisplays().some(({ workArea }) => {
    const horizontal = bounds.x < workArea.x + workArea.width && bounds.x + bounds.width > workArea.x;
    const vertical = bounds.y < workArea.y + workArea.height && bounds.y + bounds.height > workArea.y;
    return horizontal && vertical;
  });
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    fs.writeFileSync(stateFile(), JSON.stringify(mainWindow.getBounds()));
  } catch (error) {
    console.error('Could not save window state:', error);
  }
}

function trayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path fill="#ff91a8" d="M6 11 8 3l6 5h4l6-5 2 8a12 12 0 1 1-20 0Z"/>
      <circle cx="12" cy="16" r="1.5" fill="#563f48"/>
      <circle cx="20" cy="16" r="1.5" fill="#563f48"/>
      <path d="M14 20q2 2 4 0" fill="none" stroke="#563f48" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
}

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('wake-up');
}

function refreshTrayMenu() {
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开便签', click: showWindow },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: pinned,
      click: (item) => {
        pinned = item.checked;
        mainWindow?.setAlwaysOnTop(pinned, 'floating');
        mainWindow?.webContents.send('pin-changed', pinned);
        refreshTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));
}

function createTray() {
  tray = new Tray(trayIcon().resize({ width: 18, height: 18 }));
  tray.setToolTip('咪咪便签');
  refreshTrayMenu();
  tray.on('click', showWindow);
}

function createWindow() {
  const saved = readWindowState();
  const bounds = isVisibleOnAnyDisplay(saved) ? saved : defaultBounds;

  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 300,
    minHeight: 240,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: true,
    hasShadow: true,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => {
    if (!headlessTest) mainWindow.show();
  });

  if (headlessTest) {
    mainWindow.webContents.once('did-finish-load', async () => {
      const result = await mainWindow.webContents.executeJavaScript(`({
        title: document.querySelector('#title')?.value,
        noteReady: Boolean(document.querySelector('#note')),
        pinReady: Boolean(window.widget?.togglePin),
        ghostEntered: (enterGhostMode(), document.body.classList.contains('ghost')),
        wokeAgain: (wakeUp(), !document.body.classList.contains('ghost'))
      })`);
      console.log(`HEADLESS_TEST_OK ${JSON.stringify(result)}`);
      isQuitting = true;
      app.quit();
    });
  }

  let saveTimer;
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWindowState, 250);
  };
  mainWindow.on('move', scheduleSave);
  mainWindow.on('resize', scheduleSave);
  mainWindow.on('close', (event) => {
    saveWindowState();
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

ipcMain.handle('toggle-pin', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return true;
  pinned = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(pinned, 'floating');
  refreshTrayMenu();
  return pinned;
});

ipcMain.on('hide-window', () => mainWindow?.hide());

app.whenReady().then(() => {
  createWindow();
  if (!headlessTest) createTray();
  app.on('activate', showWindow);
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Keep the tray process alive if the window is ever closed unexpectedly.
app.on('window-all-closed', () => {});
