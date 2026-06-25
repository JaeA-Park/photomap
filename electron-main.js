const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 앱 데이터 경로 (사진/DB를 사용자 폴더에 저장)
const USER_DATA = app.getPath('userData');
const UPLOADS_DIR = path.join(USER_DATA, 'uploads');
const DB_PATH = path.join(USER_DATA, 'photos.json');

// 환경변수로 서버에 경로 전달
process.env.UPLOADS_DIR = UPLOADS_DIR;
process.env.DB_PATH = DB_PATH;
process.env.PORT = '3847'; // 고정 포트

// uploads 폴더 생성
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Express 서버 시작
require('./server.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Photo Map',
    icon: path.join(__dirname, 'public', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // 위치 정보(GPS) 허용
      geolocation: true
    },
    backgroundColor: '#f0f2f5',
    show: false
  });

  // 서버 준비될 때까지 잠시 대기 후 로드
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3847');
    mainWindow.show();
  }, 800);

  // 개발 모드: DevTools 열기
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // 외부 링크는 기본 브라우저로
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Electron GPS 권한 허용
app.on('web-contents-created', (event, contents) => {
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation') {
      callback(true);
    } else {
      callback(false);
    }
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
