# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy Maven descriptor and dependency files first for layer caching
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build production JAR without running tests
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl tzdata

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copy compiled JAR from builder stage
COPY --from=builder --chown=appuser:appgroup /app/target/accessibility-0.0.1-SNAPSHOT.jar ./app.jar

# Render assigns port dynamically via $PORT (defaults to 5001 locally)
ENV PORT=5001 \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

EXPOSE 5001 10000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Execute Spring Boot application
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -Dserver.port=${PORT} -jar /app/app.jar"]
