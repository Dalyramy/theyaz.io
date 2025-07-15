# 🛡️ Admin Management System

This document explains how to use the admin management system for theyaz.io.

## 📋 Overview

The admin system allows authorized users to:
- View all registered users
- Promote users to admin status
- Demote admins to regular user status
- Search and filter users
- View user statistics

## 🚀 Quick Start

### 1. Promote Your First Admin

If you don't have any admins yet, you need to promote yourself using SQL:

```sql
-- Connect to your Supabase database and run:
UPDATE public.profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

Or use the provided script:
```bash
# Run the script in your Supabase SQL editor
# File: scripts/promote-first-admin.sql
```

### 2. Access the Admin Panel

1. Log in to your account
2. Navigate to `/admin` or click the "Admin" link in the navbar
3. You'll see the admin dashboard with user management

## 🎯 Features

### Admin Dashboard
- **Statistics**: Total users, admin count, regular user count
- **User Management**: View, search, and manage all users
- **Real-time Updates**: Changes reflect immediately
- **Search**: Find users by name, username, or email

### User Management
- **Promote to Admin**: Click "Make Admin" button
- **Demote from Admin**: Click "Remove Admin" button
- **User Details**: See username, email, join date, admin status
- **Safety**: Admins cannot demote themselves

### Security Features
- **Protected Routes**: Only admins can access `/admin`
- **Self-Protection**: Admins cannot demote themselves
- **Real-time Validation**: Immediate feedback on actions
- **Error Handling**: Graceful error messages

## 🔧 Technical Details

### Database Schema
```sql
-- Profiles table with admin flag
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  is_admin boolean DEFAULT false,  -- Admin flag
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

### React Components
- **AdminPage**: Main admin dashboard component
- **AuthContext**: Handles admin status checking
- **ProtectedRoute**: Route protection for admin pages
- **Navbar**: Admin link (only visible to admins)

### API Endpoints
- `GET /profiles`: Fetch all users with admin status
- `PUT /profiles/{id}`: Update user admin status
- `GET /auth/users`: Get user authentication data

## 📱 UI Components

### Admin Panel Layout
```
┌─────────────────────────────────────┐
│ 🛡️ Admin Panel                     │
├─────────────────────────────────────┤
│ 📊 Statistics Cards                │
│ ┌─────────┬─────────┬─────────┐   │
│ │ Total   │ Admins  │ Regular │   │
│ │ Users   │         │ Users   │   │
│ └─────────┴─────────┴─────────┘   │
├─────────────────────────────────────┤
│ 🔍 Search Users                    │
├─────────────────────────────────────┤
│ 👥 User Management List            │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] User Name (Admin)     │ │
│ │ email@example.com              │ │
│ │ Joined: 2024-01-01            │ │
│ │ [Make Admin] [Remove Admin]    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🛠️ Development

### Adding New Admin Features

1. **Update Database Schema**:
   ```sql
   ALTER TABLE public.profiles 
   ADD COLUMN new_admin_feature boolean DEFAULT false;
   ```

2. **Update TypeScript Types**:
   ```typescript
   // src/integrations/supabase/types.ts
   profiles: {
     Row: {
       // ... existing fields
       new_admin_feature: boolean | null
     }
   }
   ```

3. **Update Admin Component**:
   ```typescript
   // src/pages/Admin.tsx
   const handleNewFeature = async (userId: string) => {
     await supabase
       .from('profiles')
       .update({ new_admin_feature: true })
       .eq('id', userId);
   };
   ```

### Testing Admin Features

1. **Create Test Admin**:
   ```sql
   INSERT INTO auth.users (id, email) 
   VALUES ('test-admin-id', 'admin@test.com');
   
   INSERT INTO public.profiles (id, is_admin) 
   VALUES ('test-admin-id', true);
   ```

2. **Test Admin Panel**:
   - Navigate to `/admin`
   - Verify admin-only access
   - Test user promotion/demotion
   - Test search functionality

## 🔒 Security Considerations

### Best Practices
1. **Limit Admin Access**: Only promote trusted users
2. **Regular Audits**: Review admin list periodically
3. **Backup Admins**: Always have multiple admins
4. **Monitor Changes**: Log admin status changes

### Security Features
- ✅ Route protection
- ✅ Self-demotion prevention
- ✅ Real-time validation
- ✅ Error handling
- ✅ Type safety

## 📊 Monitoring

### Admin Activity Log
```sql
-- Create admin activity log table
CREATE TABLE admin_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now()
);
```

### Admin Statistics
```sql
-- Get admin statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_admin THEN 1 END) as admin_count,
  COUNT(CASE WHEN NOT is_admin THEN 1 END) as regular_users
FROM public.profiles;
```

## 🚨 Troubleshooting

### Common Issues

1. **Can't Access Admin Panel**
   - Check if you're logged in
   - Verify your admin status in database
   - Check browser console for errors

2. **Admin Status Not Updating**
   - Refresh the page
   - Check database connection
   - Verify user ID matches

3. **Search Not Working**
   - Check search term spelling
   - Verify user exists in database
   - Check network connection

### Debug Commands
```sql
-- Check your admin status
SELECT is_admin FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- List all admins
SELECT p.username, u.email, p.is_admin 
FROM public.profiles p 
JOIN auth.users u ON p.id = u.id 
WHERE p.is_admin = true;
```

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database connectivity
3. Check user permissions
4. Review the security logs

---

**Last Updated**: 2025-07-15
**Version**: 1.0.0
**Maintainer**: theyaz.io team 