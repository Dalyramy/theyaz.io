-- Enhanced RBAC System for User Roles and Permissions
-- This migration adds a comprehensive role-based access control system

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    resource text NOT NULL, -- e.g., 'photos', 'albums', 'users'
    action text NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
    ('admin', 'Full system administrator with all permissions'),
    ('uploader', 'Can upload and manage photos, create albums'),
    ('moderator', 'Can moderate content, manage comments'),
    ('viewer', 'Can view photos and interact (like, comment)'),
    ('guest', 'Can only view public photos without interaction')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.permissions (name, description, resource, action) VALUES
    -- Photo permissions
    ('photos.create', 'Upload new photos', 'photos', 'create'),
    ('photos.read', 'View photos', 'photos', 'read'),
    ('photos.update', 'Edit photo metadata', 'photos', 'update'),
    ('photos.delete', 'Delete photos', 'photos', 'delete'),
    ('photos.moderate', 'Moderate photo content', 'photos', 'moderate'),
    
    -- Album permissions
    ('albums.create', 'Create albums', 'albums', 'create'),
    ('albums.read', 'View albums', 'albums', 'read'),
    ('albums.update', 'Edit album metadata', 'albums', 'update'),
    ('albums.delete', 'Delete albums', 'albums', 'delete'),
    
    -- User permissions
    ('users.read', 'View user profiles', 'users', 'read'),
    ('users.update', 'Update user profiles', 'users', 'update'),
    ('users.delete', 'Delete user accounts', 'users', 'delete'),
    ('users.manage', 'Manage user roles and permissions', 'users', 'manage'),
    
    -- Comment permissions
    ('comments.create', 'Create comments', 'comments', 'create'),
    ('comments.read', 'Read comments', 'comments', 'read'),
    ('comments.update', 'Edit comments', 'comments', 'update'),
    ('comments.delete', 'Delete comments', 'comments', 'delete'),
    ('comments.moderate', 'Moderate comments', 'comments', 'moderate'),
    
    -- System permissions
    ('system.admin', 'Full system administration', 'system', 'admin'),
    ('system.moderate', 'Content moderation', 'system', 'moderate'),
    ('system.analytics', 'View analytics and reports', 'system', 'analytics')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin role gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Uploader role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'uploader' 
AND p.name IN (
    'photos.create', 'photos.read', 'photos.update', 'photos.delete',
    'albums.create', 'albums.read', 'albums.update', 'albums.delete',
    'users.read', 'users.update',
    'comments.create', 'comments.read', 'comments.update', 'comments.delete'
)
ON CONFLICT DO NOTHING;

-- Moderator role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'moderator' 
AND p.name IN (
    'photos.read', 'photos.moderate',
    'albums.read',
    'users.read',
    'comments.read', 'comments.moderate',
    'system.moderate'
)
ON CONFLICT DO NOTHING;

-- Viewer role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'viewer' 
AND p.name IN (
    'photos.read',
    'albums.read',
    'users.read',
    'comments.create', 'comments.read', 'comments.update'
)
ON CONFLICT DO NOTHING;

-- Guest role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'guest' 
AND p.name IN (
    'photos.read',
    'albums.read'
)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Anyone can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Only admins can manage roles" ON public.roles FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
);

-- RLS Policies for permissions
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Only admins can manage permissions" ON public.permissions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
);

-- RLS Policies for role_permissions
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Only admins can manage role permissions" ON public.role_permissions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
);
CREATE POLICY "Only admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
);

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission_name text, resource text, action text) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.resource, p.action
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.get_user_permissions(user_uuid) 
        WHERE permission_name = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has resource action
CREATE OR REPLACE FUNCTION public.can_perform_action(user_uuid uuid, resource_name text, action_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.get_user_permissions(user_uuid) 
        WHERE resource = resource_name AND action = action_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_perform_action(uuid, text, text) TO authenticated;

-- Add default role assignment trigger
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Assign 'viewer' role to new users by default
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'viewer';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign default role
DROP TRIGGER IF EXISTS assign_default_role_trigger ON auth.users;
CREATE TRIGGER assign_default_role_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_default_role(); 