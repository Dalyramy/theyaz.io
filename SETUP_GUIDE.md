# Setup Guide - Fix Account Creation and Admin Setup

This guide will help you fix the account creation issues and set up admin accounts for your theyaz.io application.

## 🔧 Quick Fix Steps

### 1. Environment Setup

First, create your `.env` file:

```bash
cp env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Database Migration

Apply the database migrations to fix the account creation issues:

```bash
# If using Supabase CLI
supabase db reset

# Or manually apply migrations in order:
# 1. 20240324010000_add_profiles.sql
# 2. 20240624_add_rbac_system.sql  
# 3. 20241201_000001_fix_profile_creation.sql
```

### 3. Create Admin Account

Use the provided script to create an admin account:

```bash
./scripts/create-admin.sh admin@yourdomain.com yourpassword
```

Or manually:

```bash
node scripts/create-admin-user.js admin@yourdomain.com yourpassword
```

## 🚨 Issues Fixed

### Problem 1: Conflicting Triggers
- **Issue**: Multiple database triggers were trying to handle new user creation
- **Fix**: Consolidated triggers into a single function that handles both profile creation and role assignment

### Problem 2: Webhook Conflicts  
- **Issue**: Webhook function was conflicting with database triggers
- **Fix**: Removed webhook trigger and rely on database triggers only

### Problem 3: No Admin Creation Method
- **Issue**: No easy way to create admin accounts
- **Fix**: Created simple scripts for admin user creation

## 🔍 Troubleshooting

### Can't Create Regular Accounts?

1. **Check Supabase Auth Settings**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Ensure "Enable email confirmations" is OFF for testing
   - Or set up proper email templates

2. **Check Database Triggers**:
   ```sql
   -- Check if triggers exist
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'users';
   ```

3. **Verify Profile Creation**:
   ```sql
   -- Check if profiles are being created
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
   ```

### Can't Create Admin Accounts?

1. **Check Service Role Key**:
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
   - Get it from Supabase Dashboard → Settings → API

2. **Verify RBAC Tables**:
   ```sql
   -- Check if roles exist
   SELECT * FROM roles;
   
   -- Check if admin role exists
   SELECT * FROM roles WHERE name = 'admin';
   ```

3. **Manual Admin Creation**:
   ```sql
   -- Create admin user manually
   UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
   
   -- Assign admin role
   INSERT INTO user_roles (user_id, role_id, assigned_by)
   SELECT 'your-user-id', r.id, 'your-user-id'
   FROM roles r WHERE r.name = 'admin';
   ```

## 🛠️ Development Setup

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Test Account Creation**:
   - Go to `/register` and create a test account
   - Check if profile is created in Supabase
   - Verify role assignment

### Docker Development

1. **Start with Docker**:
   ```bash
   docker-compose up -d
   ```

2. **Create Admin Account**:
   ```bash
   ./scripts/create-admin.sh admin@test.com admin123
   ```

## 📋 Verification Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Can create regular user accounts
- [ ] Can create admin accounts
- [ ] Admin users have proper permissions
- [ ] Regular users have default 'viewer' role

## 🆘 Still Having Issues?

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs
   - Look for authentication errors

2. **Verify Database Schema**:
   ```sql
   -- Check all tables exist
   \dt
   
   -- Check triggers
   \d+ auth.users
   ```

3. **Test with Simple Account**:
   - Try creating account with minimal data
   - Check browser console for errors
   - Verify Supabase client configuration

## 📞 Support

If you're still experiencing issues:

1. Check the browser console for JavaScript errors
2. Verify your Supabase project settings
3. Ensure all environment variables are correct
4. Try the manual SQL steps above

The main issues were conflicting database triggers and missing admin creation tools. These have been resolved with the updated migrations and scripts. 