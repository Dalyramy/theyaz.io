import { supabase } from '@/integrations/supabase/client';
import { 
  Role, 
  Permission, 
  UserRole, 
  UserPermission, 
  UserRoleType,
  PERMISSIONS,
  RESOURCES,
  ACTIONS 
} from './types';

export class RBACService {
  // Get user roles
  static async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data || [];
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<UserPermission[]> {
    const { data, error } = await supabase
      .rpc('get_user_permissions', { user_uuid: userId });

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    return data || [];
  }

  // Check if user has specific permission
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('has_permission', { 
        user_uuid: userId, 
        permission_name: permission 
      });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data || false;
  }

  // Check if user can perform action on resource
  static async canPerformAction(userId: string, resource: string, action: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('can_perform_action', { 
        user_uuid: userId, 
        resource_name: resource, 
        action_name: action 
      });

    if (error) {
      console.error('Error checking action permission:', error);
      return false;
    }

    return data || false;
  }

  // Check if user has specific role
  static async hasRole(userId: string, roleName: UserRoleType): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role:roles(name)')
      .eq('user_id', userId)
      .eq('role.name', roleName);

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  }

  // Get all roles
  static async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data || [];
  }

  // Get all permissions
  static async getPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }

    return data || [];
  }

  // Assign role to user (admin only)
  static async assignRole(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy
      });

    if (error) {
      console.error('Error assigning role:', error);
      return false;
    }

    return true;
  }

  // Remove role from user (admin only)
  static async removeRole(userId: string, roleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      console.error('Error removing role:', error);
      return false;
    }

    return true;
  }

  // Get role permissions
  static async getRolePermissions(roleId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permission:permissions(*)
      `)
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }

    return data?.map(item => item.permission) || [];
  }

  // Batch permission checks for better performance
  static async batchPermissionCheck(
    userId: string, 
    permissions: string[]
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Use a single query to get all user permissions
    const userPermissions = await this.getUserPermissions(userId);
    const userPermissionSet = new Set(userPermissions.map(p => p.permission_name));
    
    // Check each requested permission
    for (const permission of permissions) {
      results[permission] = userPermissionSet.has(permission);
    }
    
    return results;
  }

  // Get user's primary role (highest priority)
  static async getPrimaryRole(userId: string): Promise<UserRoleType | null> {
    const userRoles = await this.getUserRoles(userId);
    
    // Define role priority (higher index = higher priority)
    const rolePriority: UserRoleType[] = ['guest', 'viewer', 'moderator', 'uploader', 'admin'];
    
    let highestPriorityRole: UserRoleType | null = null;
    let highestPriority = -1;
    
    for (const userRole of userRoles) {
      const roleName = userRole.role?.name as UserRoleType;
      const priority = rolePriority.indexOf(roleName);
      
      if (priority > highestPriority) {
        highestPriority = priority;
        highestPriorityRole = roleName;
      }
    }
    
    return highestPriorityRole;
  }

  // Check if user can access a specific feature
  static async canAccessFeature(userId: string, feature: string): Promise<boolean> {
    const featurePermissions: Record<string, string[]> = {
      'upload': [PERMISSIONS.PHOTOS.CREATE],
      'edit': [PERMISSIONS.PHOTOS.UPDATE, PERMISSIONS.ALBUMS.UPDATE],
      'delete': [PERMISSIONS.PHOTOS.DELETE, PERMISSIONS.ALBUMS.DELETE],
      'moderate': [PERMISSIONS.PHOTOS.MODERATE, PERMISSIONS.COMMENTS.MODERATE],
      'admin': [PERMISSIONS.SYSTEM.ADMIN],
      'analytics': [PERMISSIONS.SYSTEM.ANALYTICS],
      'manage_users': [PERMISSIONS.USERS.MANAGE],
    };

    const requiredPermissions = featurePermissions[feature] || [];
    if (requiredPermissions.length === 0) return false;

    const permissionResults = await this.batchPermissionCheck(userId, requiredPermissions);
    return Object.values(permissionResults).some(Boolean);
  }
}

// Permission check utilities for React components
export const usePermissionCheck = () => {
  const checkPermission = async (userId: string, permission: string): Promise<boolean> => {
    return RBACService.hasPermission(userId, permission);
  };

  const checkAction = async (userId: string, resource: string, action: string): Promise<boolean> => {
    return RBACService.canPerformAction(userId, resource, action);
  };

  const checkRole = async (userId: string, role: UserRoleType): Promise<boolean> => {
    return RBACService.hasRole(userId, role);
  };

  const checkFeature = async (userId: string, feature: string): Promise<boolean> => {
    return RBACService.canAccessFeature(userId, feature);
  };

  return {
    checkPermission,
    checkAction,
    checkRole,
    checkFeature,
  };
}; 