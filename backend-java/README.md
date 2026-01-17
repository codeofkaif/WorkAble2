# AI Job Accessibility - Java Spring Boot Backend

## Overview

This is a complete Spring Boot backend that replaces the Node.js backend while maintaining 100% API compatibility with the frontend.

## Technology Stack

- **Java 17**
- **Spring Boot 3.3.4**
- **Spring Security** (JWT Authentication)
- **Spring Data MongoDB**
- **WebFlux** (for Gemini API calls)
- **JJWT** (JWT token handling)
- **Lombok** (reduces boilerplate)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB (local or Atlas)
- Gemini API Key

## Configuration

Create environment variables or update `application.yml`:

```bash
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
export JWT_SECRET="your-secret-key-here"
export GEMINI_API_KEY="your-gemini-api-key"
export PORT=5001
```

Or set in `application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/ai-job-accessibility}

app:
  jwt:
    secret: ${JWT_SECRET:change_me}
  gemini:
    api-key: ${GEMINI_API_KEY:}
```

## Building and Running

### Build the project:
```bash
cd backend-java
./mvnw clean package
```

### Run the application:
```bash
./mvnw spring-boot:run
```

Or run the JAR:
```bash
java -jar target/accessibility-0.0.1-SNAPSHOT.jar
```

The server will start on port **5001** (matching Node.js backend).

## API Endpoints

All endpoints match the Node.js backend exactly:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (JWT protected)

### Resume
- `POST /api/resume` - Create resume (JWT protected)
- `GET /api/resume` - Get all user resumes (JWT protected)
- `GET /api/resume/:id` - Get specific resume (JWT protected)
- `PUT /api/resume/:id` - Update resume (JWT protected)
- `DELETE /api/resume/:id` - Delete resume (JWT protected)
- `POST /api/resume/generate` - AI generate resume (JWT protected)
- `POST /api/resume/upload` - Upload resume file (public)

### Health
- `GET /api/health` - Health check

## Request/Response Format

All responses match Node.js format exactly:

**Success Response:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error message"
}
```

## JWT Authentication

JWT tokens are generated with payload:
```json
{
  "id": "userId",
  "iat": timestamp,
  "exp": timestamp
}
```

Token expiration: **7 days** (matching Node.js)

Authorization header format:
```
Authorization: Bearer <token>
```

## Testing

### Register User:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "job_seeker"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Generate AI Resume:
```bash
curl -X POST http://localhost:5001/api/resume/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "prompt": "I am a software developer with 5 years of experience in React and Node.js",
    "template": "modern"
  }'
```

## Project Structure

```
backend-java/
├── src/main/java/com/ai/accessibility/
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── ResumeController.java
│   │   └── GlobalExceptionHandler.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── ResumeService.java
│   │   └── AIResumeService.java
│   ├── model/
│   │   ├── User.java
│   │   └── Resume.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── ResumeRepository.java
│   ├── security/
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── SecurityConfig.java
│   ├── web/
│   │   └── HealthController.java
│   └── AiJobAccessibilityApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

## Differences from Node.js Backend

1. **Port**: Uses 5001 (same as Node.js)
2. **JWT**: Same token format and expiration
3. **MongoDB**: Same schema and collections
4. **API**: 100% compatible responses
5. **AI**: Uses Gemini API (same as Node.js)

## Migration Notes

- Frontend requires **NO changes**
- All API routes remain identical
- JSON response format matches exactly
- JWT token format matches exactly
- MongoDB collections remain the same

## Troubleshooting

### MongoDB Connection Issues
- Check `MONGODB_URI` environment variable
- Ensure MongoDB is running or Atlas connection is valid
- Check network/firewall settings

### JWT Issues
- Verify `JWT_SECRET` matches Node.js backend secret
- Check token expiration (7 days)
- Ensure Authorization header format: `Bearer <token>`

### Gemini API Issues
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota/limits
- Review error logs for API response details

## Production Deployment

1. Set all environment variables
2. Build JAR: `./mvnw clean package`
3. Run: `java -jar target/accessibility-0.0.1-SNAPSHOT.jar`
4. Use process manager (PM2, systemd, etc.)

## License

Same as main project.
