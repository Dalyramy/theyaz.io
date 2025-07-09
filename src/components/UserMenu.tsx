import { useAuth } from '@/contexts/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { User, LogOut, Upload, Image, Settings, Shield, BarChart3, MessageSquare, Users } from 'lucide-react';
import { 
  PhotoUploadGate, 
  AdminGate, 
  ModeratorGate, 
  ContentManagerGate 
} from '@/components/ui/PermissionGate';
import { Badge } from '@/components/ui/badge';

const UserMenu = () => {
  const { user, signOut, hasRole, isAdmin } = useAuth();
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return 'U';
    const email = user.email || '';
    return email.charAt(0).toUpperCase();
  };

  // Get user's primary role for display
  const getUserRole = () => {
    if (isAdmin) return 'Admin';
    if (hasRole('moderator')) return 'Moderator';
    if (hasRole('uploader')) return 'Uploader';
    if (hasRole('viewer')) return 'Viewer';
    return 'Guest';
  };

  if (!user) {
    return (
      <Button 
        asChild 
        variant="default" 
        size="sm"
        className="h-8 rounded-full px-4 text-sm font-medium transition-transform hover:scale-105"
      >
        <Link to="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full border-2 border-background bg-muted p-0 ring-2 ring-background transition-all hover:ring-primary/20"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 mt-1 p-2"
      >
        <div className="flex items-center gap-3 p-2 pb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata.username || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-none">
              {user.email}
            </p>
            <div className="mt-1">
              <Badge 
                variant={isAdmin ? "default" : "secondary"} 
                className="text-xs"
              >
                {getUserRole()}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="my-1" />
        
        {/* Upload Option - Only show if user has upload permission */}
        <PhotoUploadGate>
          <DropdownMenuItem asChild>
            <Link 
              to="/upload" 
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Photo</span>
            </Link>
          </DropdownMenuItem>
        </PhotoUploadGate>

        {/* My Photos - Show for all authenticated users */}
        <DropdownMenuItem asChild>
          <Link 
            to="/my-photos" 
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Image className="h-4 w-4" />
            <span>My Photos</span>
          </Link>
        </DropdownMenuItem>

        {/* Admin Options */}
        <AdminGate>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem asChild>
            <Link 
              to="/admin" 
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/users" 
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </Link>
          </DropdownMenuItem>
        </AdminGate>

        {/* Moderator Options */}
        <ModeratorGate>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem asChild>
            <Link 
              to="/moderate" 
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Content Moderation</span>
            </Link>
          </DropdownMenuItem>
        </ModeratorGate>

        {/* Content Manager Options */}
        <ContentManagerGate>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem asChild>
            <Link 
              to="/analytics" 
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </DropdownMenuItem>
        </ContentManagerGate>

        {/* Settings - Show for all authenticated users */}
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem asChild>
          <Link 
            to="/profile" 
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* Debug Options - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link 
                to="/rbac-test" 
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                <Shield className="h-4 w-4" />
                <span>RBAC Test</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                to="/permission-debug" 
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Permission Debug</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
