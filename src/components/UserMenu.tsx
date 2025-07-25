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
import { User, LogOut, Upload, Image, Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return 'U';
    const email = user.email || '';
    return email.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
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
            <AvatarImage 
              src={user.user_metadata.avatar_url} 
              alt={user.email || ''} 
              className="object-cover"
            />
            <AvatarFallback className="text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 mt-1 p-2"
      >
        <div className="flex items-center gap-3 p-2 pb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={user.user_metadata.avatar_url} 
              alt={user.email || ''} 
              className="object-cover"
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata.username || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-none">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem asChild>
          <Link 
            to="/upload" 
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Photo</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            to="/my-photos" 
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Image className="h-4 w-4" />
            <span>My Photos</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            to="/profile" 
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? 'Signing out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
