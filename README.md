# Sunny Foodie

App gợi ý món ăn cho Sunny, gồm:
- frontend React + Vite
- backend Express (`server.ts`)
- gọi AI qua OpenRouter ở endpoint `/api/ai/suggest`
- có password app qua biến `SUNNY_PASSWORD`

## Chạy local

### 1) Cài dependency
```bash
npm install
```

### 2) Tạo file `.env`
```env
OPENROUTER_API_KEY=your_openrouter_key
SUNNY_PASSWORD=mat_khau_cua_ban
APP_URL=http://localhost:3000
PORT=3000
```

### 3) Chạy app
```bash
npm run dev
```

Mở web tại:
- `http://localhost:3000`

## Deploy lên Render

Vì app này có backend Express nên phải deploy dạng **Web Service**, không phải Static Site.

### Runtime
- Node

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables
```env
OPENROUTER_API_KEY=your_openrouter_key
SUNNY_PASSWORD=mat_khau_cua_ban
APP_URL=https://your-app.onrender.com
```

> `PORT` trên Render thường được cấp tự động. App đã hỗ trợ đọc `process.env.PORT`.

## Đưa code lên host như thế nào?

Cách dễ nhất là qua GitHub:

### Nếu repo đã nối GitHub
```bash
git add .
git commit -m "Prepare app for Render"
git push origin main
```

### Nếu chưa có remote
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Lưu ý bảo mật
- Không commit file `.env` thật có chứa API key.
- Chỉ khai báo env trực tiếp trên Render.
- Không gọi OpenRouter trực tiếp từ frontend vì sẽ lộ key.
