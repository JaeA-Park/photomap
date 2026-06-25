const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// ── Cloudinary 설정 ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── 로컬 fallback (Electron / 개발용) ────────────────────────
const USE_CLOUDINARY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'public', 'uploads');
const DB_PATH     = process.env.DB_PATH     || path.join(__dirname, 'photos.json');

if (!USE_CLOUDINARY && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── multer storage 선택 ──────────────────────────────────────
let storage;
if (USE_CLOUDINARY) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'photo-map', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename:    (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
  });
}
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── DB (photos.json) ─────────────────────────────────────────
const loadPhotos = () => {
  if (!fs.existsSync(DB_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return []; }
};
const savePhotos = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ── 미들웨어 ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
if (!USE_CLOUDINARY) app.use('/uploads', express.static(UPLOADS_DIR));

// ── API ──────────────────────────────────────────────────────
app.get('/api/photos', (req, res) => {
  res.json(loadPhotos());
});

app.post('/api/photos', upload.single('photo'), async (req, res) => {
  const { lat, lng, comment } = req.body;
  if (!req.file || !lat || !lng) {
    return res.status(400).json({ error: '사진, 위도, 경도는 필수입니다.' });
  }

  // Cloudinary는 path 대신 secure_url 반환
  const url = USE_CLOUDINARY
    ? req.file.path
    : `/uploads/${req.file.filename}`;

  const publicId = USE_CLOUDINARY ? req.file.filename : null;

  const newPhoto = {
    id: uuidv4(),
    filename: req.file.filename || req.file.originalname,
    url,
    publicId,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  const photos = loadPhotos();
  photos.push(newPhoto);
  savePhotos(photos);
  res.json(newPhoto);
});

app.delete('/api/photos/:id', async (req, res) => {
  const photos = loadPhotos();
  const idx = photos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '없는 사진입니다.' });

  const [deleted] = photos.splice(idx, 1);

  if (USE_CLOUDINARY && deleted.publicId) {
    await cloudinary.uploader.destroy(deleted.publicId).catch(() => {});
  } else {
    const filePath = path.join(UPLOADS_DIR, deleted.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  savePhotos(photos);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
