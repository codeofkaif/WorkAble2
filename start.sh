#!/bin/bash

echo "🚀 Starting WorkAble Platform (Spring Boot + Context Engine + React)..."

# Free up ports if previously occupied
echo "🧹 Cleaning up any previous processes on ports 5001, 8000, 3000..."
lsof -ti:5001,8000,3000 | xargs kill -9 2>/dev/null || true
sleep 1

# 1. Start Python Context Engine (Port 8000)
echo "🧠 Starting Context Engine AI/ML Service (Port 8000)..."
cd context-engine
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
PID_CONTEXT=$!
cd ..
sleep 2

# 2. Start Java Spring Boot Backend (Port 5001)
echo "☕ Starting Java Spring Boot Backend (Port 5001)..."
cd backend-java
mvn spring-boot:run &
PID_JAVA=$!
cd ..

# 3. Start React Frontend (Port 3000)
echo "🎨 Starting React Frontend (Port 3000)..."
cd frontend
npm start &
PID_FRONTEND=$!
cd ..

echo "✅ All services launched!"
echo "   - React Frontend:       http://localhost:3000"
echo "   - Spring Boot Backend:  http://localhost:5001"
echo "   - Context Engine ML:    http://localhost:8000"
echo ""
echo "Press Ctrl+C to terminate all services."

cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill -9 $PID_CONTEXT $PID_JAVA $PID_FRONTEND 2>/dev/null || true
    lsof -ti:5001,8000,3000 | xargs kill -9 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
