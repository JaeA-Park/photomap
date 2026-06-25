# Photo Map

위치 기반 사진 지도 앱 — 사진을 찍으면 GPS 위치와 함께 카카오맵에 마커로 표시됩니다.

## 기능
- 📷 카메라로 사진 촬영 또는 갤러리에서 선택
- 📍 GPS 위치 자동 첨부
- 💬 코멘트 입력 (선택)
- 🗺️ 카카오맵에 사진 썸네일 마커 표시
- 🖥️ Windows 데스크톱 앱 (Electron) / 🌐 웹 서비스 (Render)

---

## 카카오 API 키 설정

1. [https://developers.kakao.com](https://developers.kakao.com) 로그인
2. 내 애플리케이션 → 앱 추가
3. 플랫폼 → Web → 사이트 도메인 등록
   - 로컬: `http://localhost:3000`
   - Render: `https://[앱이름].onrender.com`
4. **JavaScript 키** 복사 후 `public/index.html`에서 교체:
```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=services">
```

---

## Render 배포

### 1. Cloudinary 무료 계정 생성
[https://cloudinary.com](https://cloudinary.com) → 가입 후 Dashboard에서 확인:
- Cloud Name
- API Key
- API Secret

### 2. Render 배포
1. [https://render.com](https://render.com) → 로그인
2. **New Web Service** → GitHub 저장소(`JaeA-Park/photomap`) 연결
3. 자동으로 `render.yaml` 감지 → **Apply**
4. **Environment Variables** 에서 아래 3개 입력:
   | Key | Value |
   |-----|-------|
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
5. **Deploy** 클릭

---

## 로컬 / Electron 실행

```bash
npm install

# 웹 서버만 실행
npm start

# Windows 데스크톱 앱 실행
npm run electron

# Windows 설치 파일 빌드
npm run build
```

> 로컬 실행 시 Cloudinary 환경변수가 없으면 자동으로 로컬 파일 저장 방식으로 동작합니다.

## 데이터 저장 위치
| 환경 | 사진 | DB |
|------|------|----|
| Render 배포 | Cloudinary | `/data/photos.json` (영구 디스크) |
| Electron 앱 | `%APPDATA%\photo-map\uploads\` | `%APPDATA%\photo-map\photos.json` |
| 로컬 개발 | `public/uploads/` | `photos.json` |
