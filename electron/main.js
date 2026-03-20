import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import youtubedl from 'youtube-dl-exec';
import ffmpegStatic from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, process.env.NODE_ENV === 'development' ? '../public/icon.png' : '../dist/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Necessary for local file access and canvas rendering
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ------------- IPC handlers -------------

ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled || filePaths.length === 0) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle('yt:download', async (event, url, outputDirectory) => {
  try {
    const outputTemplate = path.join(outputDirectory, '%(title)s.%(ext)s');
    
    // Replace 'app.asar' with 'app.asar.unpacked' in production for binaries
    const ffmpegPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
    const ytdlPath = youtubedl.constants.YOUTUBE_DL_PATH.replace('app.asar', 'app.asar.unpacked');
    const ytdlExec = youtubedl.create(ytdlPath);
    
    // Executing yt-dlp to extract MP3 audio using bundled ffmpeg
    await ytdlExec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: 0,
      output: outputTemplate,
      ffmpegLocation: ffmpegPath,
      noWarnings: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    
    return { success: true, message: 'Download Complete!' };
  } catch (error) {
    console.error('Yt-dlp error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('image:save', async (event, arrayBuffer, outputDirectory, filename) => {
  try {
    const fullPath = path.join(outputDirectory, filename);
    fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));
    return { success: true, path: fullPath };
  } catch (err) {
    console.error('Image Save Error:', err);
    return { success: false, error: err.message };
  }
});
