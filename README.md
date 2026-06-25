# Photo Map

위치 기반 사진 지도 앱 — 사진을 찍으면 GPS 위치와 함께 카카오맵에 마커로 표시됩니다.

## 기능
- 📷 카메라로 사진 촬영 또는 갤러리에서 선택
- 📍 GPS 위치 자동 첨부
- 💬 코멘트 입력 (선택)
- 🗺️ 카카오맵에 사진 썸네일 마커 표시
- 🖥️ Windows 데스크톱 앱 (Electron)

## 시작 전 준비

### 1. 카카오 API 키 발급
1. [https://developers.kakao.com](https://developers.kakao.com) 로그인
2. 내 애플리케이션 → 앱 추가
3. 플랫폼 → Web → `http://localhost:3847` 등록
4. **JavaScript 키** 복사

### 2. API 키 적용
`public/index.html` 에서 아래 부분을 수정:
```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=services">
```
`YOUR_KAKAO_APP_KEY` → 발급받은 JavaScript 키

## 실행 방법

### 개발 실행
```bash
npm install
npm start
```

### Windows 설치 파일 빌드
```bash
npm install
npm run build
```
`dist/` 폴더에 설치 파일(`.exe`) 생성

## 데이터 저장 위치
사진과 DB는 `%APPDATA%\photo-map\` 에 저장됩니다.
