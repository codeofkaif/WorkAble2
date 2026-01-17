# Backend Comparison: Node.js vs Spring Boot

## Overview

This project now supports **two backend implementations** that are 100% API compatible:

1. **Node.js Backend** (`backend/`) - Original implementation
2. **Spring Boot Backend** (`backend-java/`) - Enterprise migration

## Quick Comparison

| Feature | Node.js Backend | Spring Boot Backend |
|---------|----------------|---------------------|
| **Language** | JavaScript | Java 17 |
| **Framework** | Express 5 | Spring Boot 3.3.4 |
| **Database** | Mongoose | Spring Data MongoDB |
| **Authentication** | JWT (jsonwebtoken) | JWT (JJWT) + Spring Security |
| **Password Hashing** | bcryptjs | BCrypt (Spring Security) |
| **AI Integration** | @google/generative-ai | WebFlux + REST API |
| **Port** | 5001 | 5001 |
| **API Compatibility** | ✅ | ✅ (100% match) |
| **Frontend Changes** | None | None required |
| **MongoDB Collections** | Same | Same (no migration) |
| **JWT Token Format** | Same | Same (interchangeable) |

## API Endpoints (Both Backends)

Both backends expose identical endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (JWT protected)

### Resume Management
- `POST /api/resume` - Create resume (JWT protected)
- `GET /api/resume` - Get all user resumes (JWT protected)
- `GET /api/resume/:id` - Get specific resume (JWT protected)
- `PUT /api/resume/:id` - Update resume (JWT protected)
- `DELETE /api/resume/:id` - Delete resume (JWT protected)
- `POST /api/resume/generate` - AI generate resume (JWT protected)
- `POST /api/resume/upload` - Upload resume file

### Health Check
- `GET /api/health` - Health check endpoint

## Request/Response Format

Both backends return identical JSON responses:

**Success:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error message"
}
```

## JWT Token Format

Both backends generate tokens with the same format:
- **Payload:** `{ "id": "userId" }`
- **Expiration:** 7 days
- **Header:** `Authorization: Bearer <token>`
- **Interchangeable:** Tokens from one backend work with the other!

## MongoDB Schema

Both backends use the same MongoDB collections:
- `users` collection
- `resumes` collection
- Same field names and structure
- No data migration needed when switching backends

## When to Use Which Backend?

### Use Node.js Backend When:
- ✅ Quick prototyping and development
- ✅ Familiar with JavaScript/Node.js ecosystem
- ✅ Need fast iteration and easy debugging
- ✅ Smaller team or solo development
- ✅ Learning project or portfolio

### Use Spring Boot Backend When:
- ✅ Enterprise/production deployment
- ✅ Placement interviews (Java is preferred)
- ✅ Need type safety and compile-time checks
- ✅ Large team with Java expertise
- ✅ Need better scalability and performance
- ✅ Want enterprise-grade architecture

## Setup Comparison

### Node.js Backend Setup
```bash
cd backend
npm install
# Set environment variables in config.env
npm start
```

### Spring Boot Backend Setup
```bash
cd backend-java
mvn clean package
# Set environment variables
mvn spring-boot:run
```

## Environment Variables

Both backends use similar environment variables:

| Variable | Node.js | Spring Boot |
|----------|---------|-------------|
| MongoDB URI | `MONGODB_URI` | `MONGODB_URI` |
| JWT Secret | `JWT_SECRET` | `JWT_SECRET` |
| Gemini API Key | `GEMINI_API_KEY` | `GEMINI_API_KEY` |
| Port | `PORT` (default: 5001) | `PORT` (default: 5001) |

## Performance Comparison

| Metric | Node.js | Spring Boot |
|--------|---------|-------------|
| **Startup Time** | Faster (~1-2s) | Slower (~5-10s) |
| **Memory Usage** | Lower (~100-200MB) | Higher (~300-500MB) |
| **Request Handling** | Event-driven, async | Thread pool, concurrent |
| **Scalability** | Good for I/O-bound | Better for CPU-bound |
| **Type Safety** | Runtime checks | Compile-time checks |

## Code Structure Comparison

### Node.js Backend
```
backend/
├── server.js              # Express setup
├── routes/                # Route handlers
│   ├── authRoutes.js
│   └── resumeRoutes.js
├── models/                # Mongoose schemas
│   ├── User.js
│   └── Resume.js
├── middleware/            # Express middleware
│   └── auth.js
└── services/             # Business logic
    └── smsService.js
```

### Spring Boot Backend
```
backend-java/
├── src/main/java/com/ai/accessibility/
│   ├── controller/        # REST controllers
│   │   ├── AuthController.java
│   │   └── ResumeController.java
│   ├── service/          # Business logic
│   │   ├── AuthService.java
│   │   └── ResumeService.java
│   ├── model/            # MongoDB entities
│   │   ├── User.java
│   │   └── Resume.java
│   ├── repository/       # Data access
│   │   ├── UserRepository.java
│   │   └── ResumeRepository.java
│   └── security/         # Security config
│       ├── JwtUtil.java
│       └── SecurityConfig.java
└── src/main/resources/
    └── application.yml   # Configuration
```

## Migration Path

If you're currently using Node.js backend and want to switch to Spring Boot:

1. ✅ **No frontend changes** - Frontend works with both
2. ✅ **No database migration** - Same MongoDB collections
3. ✅ **No data loss** - All data remains accessible
4. ✅ **JWT tokens work** - Tokens are interchangeable
5. ✅ **Same API** - All endpoints identical

Simply:
1. Stop Node.js backend
2. Start Spring Boot backend
3. Frontend continues working without changes!

## Conclusion

Both backends are production-ready and offer the same functionality. Choose based on:
- **Team expertise** (JavaScript vs Java)
- **Project requirements** (quick dev vs enterprise)
- **Placement needs** (Java preferred in many companies)
- **Performance needs** (I/O-bound vs CPU-bound)

The frontend is **100% compatible** with both, so you can switch anytime without any frontend changes!
