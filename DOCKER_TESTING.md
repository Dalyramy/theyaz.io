# 🐳 Docker Testing Guide for theyaz.io

This guide will help you set up and test your RBAC system using Docker for local development.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- Supabase CLI installed (`brew install supabase/tap/supabase`)

## 🚀 Quick Start

### 1. Start the Development Environment

```bash
# Start all services
./scripts/docker-dev.sh start

# Check status
./scripts/docker-dev.sh status
```

### 2. Access Services

Once started, you can access:

- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:54322
- **Supabase API**: http://localhost:54321
- **Mailhog (Email Testing)**: http://localhost:8025
- **Redis**: localhost:6379

### 3. Run Database Migrations

```bash
# Run migrations
./scripts/docker-dev.sh migrate
```

## 🧪 Testing RBAC System

### Manual Testing

1. **Start the environment**:
   ```bash
   ./scripts/docker-dev.sh start
   ```

2. **Create test users**:
   ```bash
   ./scripts/test-rbac.sh create-users
   ```

3. **Test different roles**:
   - Visit http://localhost:5173/rbac-test
   - Login with different test accounts
   - Verify permissions work correctly

### Automated Testing

```bash
# Run automated tests
./scripts/test-rbac.sh run-tests

# View test scenarios
./scripts/test-rbac.sh scenarios
```

## 🔧 Development Commands

### Docker Management

```bash
# Start development environment
./scripts/docker-dev.sh start

# Stop development environment
./scripts/docker-dev.sh stop

# Restart development environment
./scripts/docker-dev.sh restart

# View logs
./scripts/docker-dev.sh logs
./scripts/docker-dev.sh logs frontend
./scripts/docker-dev.sh logs supabase

# Reset environment (removes all data)
./scripts/docker-dev.sh reset

# Check status
./scripts/docker-dev.sh status
```

### RBAC Testing

```bash
# Create test users
./scripts/test-rbac.sh create-users

# Assign roles to users
./scripts/test-rbac.sh assign-roles

# Test RBAC endpoints
./scripts/test-rbac.sh test-endpoints

# Run automated tests
./scripts/test-rbac.sh run-tests

# View test scenarios
./scripts/test-rbac.sh scenarios
```

## 🎯 Test Scenarios

### 1. Guest User (Not logged in)
- ✅ Should see limited navigation
- ✅ Should be redirected to login for protected routes
- ✅ Should see public gallery
- ❌ Should NOT see upload button
- ❌ Should NOT access admin areas

### 2. Viewer User
- ✅ Should see basic navigation
- ✅ Should access public gallery
- ✅ Should see photo details
- ❌ Should NOT see upload button
- ❌ Should NOT access admin areas

### 3. Uploader User
- ✅ Should see upload functionality
- ✅ Should access my photos
- ✅ Should edit/delete own photos
- ❌ Should NOT access admin areas

### 4. Moderator User
- ✅ Should see moderation tools
- ✅ Should access content moderation
- ✅ Should moderate comments
- ❌ Should NOT access user management

### 5. Admin User
- ✅ Should see all navigation items
- ✅ Should access admin dashboard
- ✅ Should access user management
- ✅ Should have all permissions

## 🔍 Debugging

### View Logs

```bash
# All services
./scripts/docker-dev.sh logs

# Specific service
./scripts/docker-dev.sh logs frontend
./scripts/docker-dev.sh logs supabase
```

### Permission Debug Tool

Visit http://localhost:5173/permission-debug to see:
- Current user role
- Available permissions
- Permission test results
- Role hierarchy

### Supabase Studio

Visit http://localhost:54322 to:
- View database tables
- Check user roles
- Monitor authentication
- Test RPC functions

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :5173
   lsof -i :54321
   ```

2. **Docker not running**:
   ```bash
   # Start Docker Desktop
   open -a Docker
   ```

3. **Migration errors**:
   ```bash
   # Reset database
   ./scripts/docker-dev.sh reset
   ```

4. **Frontend not loading**:
   ```bash
   # Check frontend logs
   ./scripts/docker-dev.sh logs frontend
   ```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v
docker system prune -f

# Start fresh
./scripts/docker-dev.sh start
```

## 📊 Monitoring

### Health Checks

```bash
# Check service health
curl http://localhost:5173
curl http://localhost:54321/health
```

### Performance Monitoring

- **Frontend**: http://localhost:5173
- **Database**: http://localhost:54322 (Supabase Studio)
- **Email**: http://localhost:8025 (Mailhog)

## 🔐 Security Testing

### Test Authentication

1. **Login/Logout flow**
2. **Password reset**
3. **Email verification**
4. **Session management**

### Test Authorization

1. **Route protection**
2. **Component-level permissions**
3. **API endpoint protection**
4. **Data access control**

## 📝 Environment Variables

Copy `env.docker.example` to `.env.local`:

```bash
cp env.docker.example .env.local
```

Key variables:
- `VITE_SUPABASE_URL`: Local Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Local Supabase anon key
- `ENABLE_RBAC`: Enable RBAC features
- `NODE_ENV`: Development mode

## 🎉 Next Steps

1. **Test all user roles** with the RBAC test page
2. **Verify permissions** work correctly
3. **Test edge cases** and error handling
4. **Performance testing** with multiple users
5. **Security testing** with different scenarios

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [RBAC Implementation Guide](./RBAC_IMPLEMENTATION.md)
- [Testing Best Practices](./TESTING_GUIDE.md) 