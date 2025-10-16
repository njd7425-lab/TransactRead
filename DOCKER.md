# Docker Setup Guide

## Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/njd7425-lab/TransactRead.git
cd TransactRead

# Run the automated setup script
./docker-setup.sh
```

### Manual Setup

1. **Environment Configuration**:
```bash
# Copy the Docker environment template
cp docker.env.example .env

# Edit .env with your API keys
nano .env
```

2. **Start the Application**:
```bash
# Build and start
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

3. **Initialize Database**:
```bash
# Run database migrations and seed data
docker-compose exec app npm run seed
```

## Docker Commands Reference

### Basic Operations

```bash
# Start the application
docker-compose up

# Start in background
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Restart the application
docker-compose restart
```

### Development Commands

```bash
# Rebuild after code changes
docker-compose up --build

# Access container shell
docker-compose exec app sh

# Run specific commands
docker-compose exec app npm run seed
docker-compose exec app npx prisma studio
docker-compose exec app npm test

# View container status
docker-compose ps
```

### Database Operations

```bash
# Initialize database
docker-compose exec app npm run seed

# Access Prisma Studio
docker-compose exec app npx prisma studio

# Run database migrations
docker-compose exec app npx prisma db push

# Generate Prisma client
docker-compose exec app npx prisma generate
```

### Monitoring and Debugging

```bash
# View application logs
docker-compose logs -f app

# Check container health
docker-compose ps

# Access container filesystem
docker-compose exec app sh

# View resource usage
docker stats
```

### Cleanup Commands

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Clean up unused Docker resources
docker system prune -a
```

## Environment Variables

### Required Variables

```env
# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Etherscan API (get from https://etherscan.io/apis)
ETHERSCAN_API_KEY=your-etherscan-api-key

# Gemini AI (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key

# Firebase Configuration (get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Optional Variables

```env
# Database URL (defaults to SQLite)
DATABASE_URL=file:./dev.db

# Node environment
NODE_ENV=production

# Port (defaults to 3001)
PORT=3001
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 docker-compose up
```

2. **Database Connection Issues**:
```bash
# Check database file permissions
docker-compose exec app ls -la server/prisma/

# Reset database
docker-compose exec app rm -f server/prisma/dev.db
docker-compose exec app npm run seed
```

3. **Build Failures**:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

4. **Permission Issues**:
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended)
sudo docker-compose up
```

### Health Checks

```bash
# Check application health
curl http://localhost:3001/api/health

# Check container health
docker-compose ps

# View health check logs
docker-compose logs app | grep health
```

## Production Deployment

### Environment Setup

```bash
# Set production environment
export NODE_ENV=production
export JWT_SECRET=your-secure-production-jwt-secret

# Use production environment file
cp docker.env.example .env.production
# Edit .env.production with production values
```

### Deployment Commands

```bash
# Deploy to production
docker-compose -f docker-compose.yml up -d --build

# Check deployment status
docker-compose ps

# Monitor logs
docker-compose logs -f

# Scale the application (if needed)
docker-compose up -d --scale app=2
```

### Security Considerations

1. **Use strong JWT secrets**
2. **Keep API keys secure**
3. **Use HTTPS in production**
4. **Regular security updates**
5. **Monitor container logs**

## Performance Optimization

### Resource Limits

```yaml
# Add to docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Caching

```bash
# Use Docker layer caching
docker-compose build --parallel

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build
```

## Monitoring

### Log Management

```bash
# View specific service logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app

# View logs with timestamps
docker-compose logs -t app
```

### Resource Monitoring

```bash
# Monitor container resources
docker stats

# Monitor specific container
docker stats transactread_app_1
```

## Backup and Recovery

### Database Backup

```bash
# Backup database
docker-compose exec app cp server/prisma/dev.db /backup/dev.db.backup

# Restore database
docker-compose exec app cp /backup/dev.db.backup server/prisma/dev.db
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v transactread_app_data:/data -v $(pwd):/backup alpine tar czf /backup/app_data.tar.gz -C /data .

# Restore volumes
docker run --rm -v transactread_app_data:/data -v $(pwd):/backup alpine tar xzf /backup/app_data.tar.gz -C /data
```

This Docker setup provides a complete, production-ready environment for running TransactRead with minimal configuration required.
