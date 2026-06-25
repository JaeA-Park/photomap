const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 사진 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// DB 역할: photos.json 파일
const DB_PATH = path.join(__dirname, 'photos.json');
const loadPhotos = () => {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};
const savePhotos = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// 사진 목록 조회
app.get('/api/photos', (req, res) => {
  res.json(loadPhotos());
});

// 사진 업로드
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

// 사진 삭제
app.delete('/api/photos/:id', (req, res) => {
  const photos = loadPhotos();
  const idx = photos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '없는 사진입니다.' });

  const [deleted] = photos.splice(idx, 1);
  const filePath = path.join(__dirname, 'public', 'uploads', deleted.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  savePhotos(photos);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
