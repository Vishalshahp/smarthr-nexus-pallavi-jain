# SmartHR Nexus — Deployment Guide

## 🚀 Option 1: Run Locally (Development)

### Prerequisites
- Node.js 18+, MongoDB, Redis, Git

```bash
# 1. Install dependencies
cd backend  && npm install
cd ../frontend && npm install

# 2. Configure backend
cd ../backend
cp .env.example .env
# Edit .env — set MONGODB_URI, GEMINI_API_KEY, JWT_SECRET

# 3. Configure frontend
cd ../frontend
echo "VITE_GEMINI_API_KEY=your-key-here" >> .env

# 4. Seed database with demo data
cd ../backend && node src/utils/seeder.js --reset

# 5. Start both servers
cd .. && npm run dev
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:5000
```

### Demo Login Credentials
| Role           | Email               | Password       |
|----------------|---------------------|----------------|
| Admin          | admin@demo.com      | Admin@1234     |
| Senior Manager | manager@demo.com    | Manager@1234   |
| HR Recruiter   | hr@demo.com         | HR@1234        |
| Employee       | employee@demo.com   | Employee@1234  |

---

## 🐳 Option 2: Docker (Recommended for Production)

```bash
# 1. Copy and fill env file
cp .env.production .env

# 2. Build and start all services
docker-compose up -d --build

# 3. Seed database
docker exec smarthr_backend node src/utils/seeder.js --reset

# 4. Open http://localhost
```

---

## ☁️ Option 3: Deploy to Cloud

### Render.com (Free tier available)

**Backend:**
1. New → Web Service → Connect GitHub repo
2. Root Directory: `backend`
3. Build: `npm install`
4. Start: `node src/server.js`
5. Add all environment variables from `backend/.env.example`

**Frontend:**
1. New → Static Site → Connect GitHub repo
2. Root Directory: `frontend`
3. Build: `npm run build`
4. Publish: `dist`
5. Add `VITE_GEMINI_API_KEY` in environment

**Database:**
- Use MongoDB Atlas (free M0 cluster): https://cloud.mongodb.com
- Use Upstash Redis (free): https://upstash.com

### Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# Deploy backend
cd backend && railway up

# Deploy frontend (set env vars in dashboard)
cd ../frontend && npm run build
# Upload dist/ to Netlify or Vercel
```

### Vercel (Frontend) + Railway (Backend)

**Frontend → Vercel:**
```bash
cd frontend
npm i -g vercel
vercel --prod
# Set VITE_GEMINI_API_KEY in Vercel dashboard
```

**Backend → Railway:**
- Connect GitHub → select backend folder → deploy

---

## 🔑 Google Gemini API Key Setup

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Add to backend `.env`:   `GEMINI_API_KEY=AIza...`
5. Add to frontend `.env`:  `VITE_GEMINI_API_KEY=AIza...`

**Features enabled with Gemini:**
- ✅ ARIA HR Chatbot (voice + text)
- ✅ AI Resume Screening (auto-scores 0–100)
- ✅ AI Job Description Generator
- ✅ Performance Insights
- ✅ Payroll Optimization Suggestions
- ✅ Interview Transcript Analysis

---

## 📦 Environment Variables Reference

### Backend (`backend/.env`)
```
MONGODB_URI=mongodb://localhost:27017/smarthr_nexus
REDIS_URL=redis://localhost:6379
JWT_SECRET=64-char-random-string
JWT_REFRESH_SECRET=another-64-char-string
GEMINI_API_KEY=AIza...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=gmail-app-password
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=/api/v1
VITE_GEMINI_API_KEY=AIza...
```

---

## 🗄️ Database Seeder

```bash
# Seed with fresh data (DELETES existing data first)
node src/utils/seeder.js --reset

# Seed without deleting existing data
node src/utils/seeder.js

# What gets seeded:
# - 8 departments
# - 15 users (4 demo accounts + 11 employees)
# - 15 employee profiles
# - ~600 attendance records (60 days)
# - 90 payroll records (6 months)
# - 60+ leave records
# - 36 performance reviews
# - 6 job listings
# - 60+ applications with AI screening data
# - Notifications for all users
```
