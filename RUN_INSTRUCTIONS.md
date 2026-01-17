# 🚀 प्रोजेक्ट चलाने के लिए निर्देश (How to Run the Project)

## 📋 आवश्यकताएं (Prerequisites)

### Node.js Backend के लिए:
1. **Node.js** (v16 या उससे ऊपर) - [Download](https://nodejs.org/)
2. **npm** (Node.js के साथ आता है)
3. **MongoDB** - Database के लिए (आपके config.env में cloud MongoDB URI है, तो local MongoDB जरूरी नहीं)

### Spring Boot Backend के लिए (वैकल्पिक):
1. **Java 17+** - [Download](https://adoptium.net/)
2. **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
3. **MongoDB** - Same database (कोई change नहीं)

## 🔧 सेटअप (Setup)

### विकल्प 1: Node.js Backend (Original - सबसे आसान)

#### start.sh script का उपयोग:
```bash
# Terminal में project folder में जाएं
cd "/Users/kaifkhan/college/Workable TestFile/ai-job-accessibility"

# Script को executable बनाएं (पहली बार)
chmod +x start.sh

# Script चलाएं
./start.sh
```

#### Manual Setup:
```bash
# Step 1: Backend Dependencies Install करें
cd backend
npm install
cd ..

# Step 2: Frontend Dependencies Install करें
cd frontend
npm install
cd ..

# Step 3: Frontend .env File बनाएं (अगर नहीं है)
cd frontend
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
cd ..

# Step 4: Backend Server चलाएं (एक terminal में)
cd backend
npm start
# या development mode के लिए:
npm run dev

# Step 5: Frontend Server चलाएं (दूसरे terminal में)
cd frontend
npm start
```

### विकल्प 2: Spring Boot Backend (Enterprise - Placement Ready) 🆕

```bash
# Step 1: Backend Build करें
cd backend-java
mvn clean package

# Step 2: Environment Variables Set करें
export MONGODB_URI="your-mongodb-uri"
export JWT_SECRET="your-jwt-secret"
export GEMINI_API_KEY="your-gemini-key"
export PORT=5001

# Step 3: Backend Server चलाएं (एक terminal में)
mvn spring-boot:run
# या JAR file से:
java -jar target/accessibility-0.0.1-SNAPSHOT.jar

# Step 4: Frontend Server चलाएं (दूसरे terminal में)
cd frontend
npm install
npm start
```

**नोट:** Spring Boot backend भी port 5001 पर चलेगा और frontend बिना किसी change के काम करेगा!

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API** (Node.js): http://localhost:5001
- **Backend API** (Spring Boot): http://localhost:5001 (same port!)
- **Health Check**: http://localhost:5001/api/health
- **Spring Boot Health**: http://localhost:5001/api/health

**नोट:** दोनों backends same port (5001) पर चलते हैं, इसलिए एक समय में एक ही backend चलाएं!

## ⚠️ महत्वपूर्ण नोट्स

1. **MongoDB**: 
   - Node.js Backend: `backend/config.env` में MongoDB cloud URI है
   - Spring Boot Backend: Environment variables या `application.yml` में MongoDB URI set करें
   - दोनों backends same MongoDB database use करते हैं (कोई migration नहीं!)

2. **Ports**: 
   - Backend port 5001 पर चलेगा (दोनों backends के लिए)
   - Frontend port 3000 पर चलेगा
   - अगर ये ports busy हैं, तो error आएगी
   - **Important:** एक समय में एक ही backend चलाएं (Node.js या Spring Boot)

3. **Environment Variables**: 
   - **Node.js Backend:** `backend/config.env` file में सब कुछ सेट है
   - **Spring Boot Backend:** Environment variables या `backend-java/src/main/resources/application.yml` में set करें
   - Frontend के लिए `frontend/.env` file बनानी होगी (ऊपर दिया गया है)

4. **Backend Choice:**
   - **Node.js:** Quick development, easy to modify, familiar stack
   - **Spring Boot:** Enterprise-grade, placement-ready, type-safe, scalable
   - **Frontend:** दोनों backends के साथ बिना किसी change के काम करता है!

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

### Node.js Backend:
```bash
# सभी dependencies install करें
cd backend && npm install && cd ../frontend && npm install && cd ..

# Backend चलाएं (एक terminal में)
cd backend && npm start

# Frontend चलाएं (दूसरे terminal में)
cd frontend && npm start
```

### Spring Boot Backend:
```bash
# Backend build और run करें
cd backend-java && mvn clean package && mvn spring-boot:run

# Frontend चलाएं (दूसरे terminal में)
cd frontend && npm start
```

---
**नोट**: 
- दोनों servers (backend और frontend) एक साथ चलने चाहिए ताकि application properly काम करे।
- एक समय में एक ही backend चलाएं (Node.js या Spring Boot)।
- Frontend दोनों backends के साथ बिना किसी change के काम करता है!

