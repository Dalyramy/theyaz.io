// Permission Gates
export { default as PermissionGate } from '@/components/ui/PermissionGate';
export {
  AdminGate,
  UploaderGate,
  ModeratorGate,
  ViewerGate,
  PhotoUploadGate,
  PhotoEditGate,
  PhotoDeleteGate,
  AlbumCreateGate,
  CommentCreateGate,
  CommentModerateGate,
  UserManageGate,
  ContentManagerGate,
  FullAdminGate
} from '@/components/ui/PermissionGate';

// Content Protection
export { default as ContentProtection } from '@/components/protection/ContentProtection';
export {
  AdminOnly,
  UploaderOnly,
  ModeratorOnly,
  ViewerOnly,
  PhotoUploadOnly,
  ProtectedContent,
  RoleBasedContent
} from '@/components/protection/ContentProtection';

// Navigation
export { default as RoleBasedNav } from '@/components/navigation/RoleBasedNav';

// Admin Components
export { default as AdminDashboard } from '@/components/admin/AdminDashboard';

// Debug Components
export { default as PermissionDebug } from '@/components/debug/PermissionDebug';
export { default as RBACTest } from '@/components/RBACTest';

// Services
export { RBACService } from '@/lib/rbac';

// Hooks
export { useAuth } from '@/contexts/useAuth';

// Types
export type {
  UserRoleType,
  UserRole,
  UserPermission,
  Role,
  Permission
} from '@/lib/types'; 