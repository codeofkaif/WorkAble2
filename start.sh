#!/bin/bash

echo "🚀 Starting AI Job Accessibility Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Create frontend .env if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "🔧 Creating frontend environment file..."
    echo "REACT_APP_API_URL=http://localhost:5001/api" > frontend/.env
fi

echo "🎯 Starting development servers..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend will be available at: http://localhost:5001"
echo "📊 Health check: http://localhost:5001/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start both servers
npm run dev
