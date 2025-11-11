# 🚀 प्रोजेक्ट चलाने के लिए निर्देश (How to Run the Project)

## 📋 आवश्यकताएं (Prerequisites)

1. **Node.js** (v16 या उससे ऊपर) - [Download](https://nodejs.org/)
2. **npm** (Node.js के साथ आता है)
3. **MongoDB** - Database के लिए (आपके config.env में cloud MongoDB URI है, तो local MongoDB जरूरी नहीं)

## 🔧 सेटअप (Setup)

### विकल्प 1: start.sh script का उपयोग (सबसे आसान)

```bash
# Terminal में project folder में जाएं
cd "/Users/kaifkhan/college/Documents/jobAccesesblity copy/ai-job-accessibility"

# Script को executable बनाएं (पहली बार)
chmod +x start.sh

# Script चलाएं
./start.sh
```

### विकल्प 2: Manual Setup

#### Step 1: Backend Dependencies Install करें
```bash
cd backend
npm install
cd ..
```

#### Step 2: Frontend Dependencies Install करें
```bash
cd frontend
npm install
cd ..
```

#### Step 3: Frontend .env File बनाएं (अगर नहीं है)
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
cd ..
```

#### Step 4: Backend Server चलाएं
```bash
cd backend
npm start
# या development mode के लिए:
npm run dev
```

**नया terminal खोलें और:**

#### Step 5: Frontend Server चलाएं
```bash
cd frontend
npm start
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## ⚠️ महत्वपूर्ण नोट्स

1. **MongoDB**: आपके `backend/config.env` में MongoDB cloud URI है, तो local MongoDB install करने की जरूरत नहीं है।

2. **Ports**: 
   - Backend port 5001 पर चलेगा
   - Frontend port 3000 पर चलेगा
   - अगर ये ports busy हैं, तो error आएगी

3. **Environment Variables**: 
   - Backend के लिए `backend/config.env` file में सब कुछ सेट है
   - Frontend के लिए `frontend/.env` file बनानी होगी (ऊपर दिया गया है)

## 🐛 अगर कोई समस्या आए

### Port already in use error:
```bash
# Port 5001 check करें
lsof -ti:5001
# अगर कोई process चल रहा है, तो kill करें:
kill -9 $(lsof -ti:5001)

# Port 3000 check करें
lsof -ti:3000
kill -9 $(lsof -ti:3000)
```

### Dependencies install नहीं हो रही:
```bash
# Cache clear करें
npm cache clean --force

# node_modules delete करें और फिर से install करें
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection error:
- `backend/config.env` में MongoDB URI check करें
- Internet connection check करें (cloud MongoDB के लिए)

## 📝 Quick Commands Summary

```bash
# सभी dependencies install करें
cd backend && npm install && cd ../frontend && npm install && cd ..

# Backend चलाएं (एक terminal में)
cd backend && npm start

# Frontend चलाएं (दूसरे terminal में)
cd frontend && npm start
```

---
**नोट**: दोनों servers (backend और frontend) एक साथ चलने चाहिए ताकि application properly काम करे।

