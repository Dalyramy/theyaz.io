export interface Like {
  id: string;
  user_id: string;
  photo_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  photo_id: string;
  user_profile?: {
    username: string;
    avatar_url: string;
  };
  likes?: number;
}

// Add type declarations for global objects added by third-party scripts
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

// RBAC System Types
export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_by?: string;
  created_at: string;
  role?: Role;
}

export interface UserPermission {
  permission_name: string;
  resource: string;
  action: string;
}

export type UserRoleType = 'admin' | 'uploader' | 'moderator' | 'viewer' | 'guest';

export interface PermissionCheck {
  resource: string;
  action: string;
}

// Permission constants for easy reference
export const PERMISSIONS = {
  // Photo permissions
  PHOTOS: {
    CREATE: 'photos.create',
    READ: 'photos.read',
    UPDATE: 'photos.update',
    DELETE: 'photos.delete',
    MODERATE: 'photos.moderate',
  },
  // Album permissions
  ALBUMS: {
    CREATE: 'albums.create',
    READ: 'albums.read',
    UPDATE: 'albums.update',
    DELETE: 'albums.delete',
  },
  // User permissions
  USERS: {
    READ: 'users.read',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE: 'users.manage',
  },
  // Comment permissions
  COMMENTS: {
    CREATE: 'comments.create',
    READ: 'comments.read',
    UPDATE: 'comments.update',
    DELETE: 'comments.delete',
    MODERATE: 'comments.moderate',
  },
  // System permissions
  SYSTEM: {
    ADMIN: 'system.admin',
    MODERATE: 'system.moderate',
    ANALYTICS: 'system.analytics',
  },
} as const;

// Resource types
export const RESOURCES = {
  PHOTOS: 'photos',
  ALBUMS: 'albums',
  USERS: 'users',
  COMMENTS: 'comments',
  SYSTEM: 'system',
} as const;

// Action types
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MODERATE: 'moderate',
  ADMIN: 'admin',
  ANALYTICS: 'analytics',
} as const;

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<UserRoleType, string[]> = {
  admin: Object.values(PERMISSIONS.PHOTOS).concat(
    Object.values(PERMISSIONS.ALBUMS),
    Object.values(PERMISSIONS.USERS),
    Object.values(PERMISSIONS.COMMENTS),
    Object.values(PERMISSIONS.SYSTEM)
  ),
  uploader: [
    PERMISSIONS.PHOTOS.CREATE,
    PERMISSIONS.PHOTOS.READ,
    PERMISSIONS.PHOTOS.UPDATE,
    PERMISSIONS.PHOTOS.DELETE,
    PERMISSIONS.ALBUMS.CREATE,
    PERMISSIONS.ALBUMS.READ,
    PERMISSIONS.ALBUMS.UPDATE,
    PERMISSIONS.ALBUMS.DELETE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.COMMENTS.CREATE,
    PERMISSIONS.COMMENTS.READ,
    PERMISSIONS.COMMENTS.UPDATE,
    PERMISSIONS.COMMENTS.DELETE,
  ],
  moderator: [
    PERMISSIONS.PHOTOS.READ,
    PERMISSIONS.PHOTOS.MODERATE,
    PERMISSIONS.ALBUMS.READ,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COMMENTS.READ,
    PERMISSIONS.COMMENTS.MODERATE,
    PERMISSIONS.SYSTEM.MODERATE,
  ],
  viewer: [
    PERMISSIONS.PHOTOS.READ,
    PERMISSIONS.ALBUMS.READ,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COMMENTS.CREATE,
    PERMISSIONS.COMMENTS.READ,
    PERMISSIONS.COMMENTS.UPDATE,
  ],
  guest: [
    PERMISSIONS.PHOTOS.READ,
    PERMISSIONS.ALBUMS.READ,
  ],
};

// Extended AuthContext types
export interface ExtendedUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    username?: string;
  };
  roles?: UserRole[];
  permissions?: UserPermission[];
}

export interface AuthContextType {
  user: ExtendedUser | null;
  session: any;
  isLoading: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  canPerformAction: (resource: string, action: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string, username?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserPermissions: () => Promise<void>;
}
