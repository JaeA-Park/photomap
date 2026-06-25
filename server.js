const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Electron이 설정한 경로 사용, 없으면 로컬 기본값
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'public', 'uploads');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'photos.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const loadPhotos = () => {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};
const savePhotos = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

app.get('/api/photos', (req, res) => {
  res.json(loadPhotos());
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
  const { lat, lng, comment } = req.body;
  if (!req.file || !lat || !lng) {
    return res.status(400).json({ error: '사진, 위도, 경도는 필수입니다.' });
  }
  const newPhoto = {
    id: uuidv4(),
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  const photos = loadPhotos();
  photos.push(newPhoto);
  savePhotos(photos);
  res.json(newPhoto);
});

app.delete('/api/photos/:id', (req, res) => {
  const photos = loadPhotos();
  const idx = photos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '없는 사진입니다.' });
  const [deleted] = photos.splice(idx, 1);
  const filePath = path.join(UPLOADS_DIR, deleted.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  savePhotos(photos);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
