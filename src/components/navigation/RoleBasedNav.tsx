import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { 
  AdminGate, 
  UploaderGate, 
  ModeratorGate, 
  ViewerGate,
  PhotoUploadGate,
  ContentManagerGate
} from '@/components/ui/PermissionGate';
import { 
  Upload, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Image,
  Album,
  Eye
} from 'lucide-react';

const RoleBasedNav = () => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Guest/Viewer Navigation */}
      <ViewerGate>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/gallery">
            <Eye className="mr-2 h-4 w-4" />
            Browse Gallery
          </a>
        </Button>
      </ViewerGate>

      {/* Uploader Navigation */}
      <UploaderGate>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </a>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/my-photos">
              <Image className="mr-2 h-4 w-4" />
              My Photos
            </a>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/albums">
              <Album className="mr-2 h-4 w-4" />
              My Albums
            </a>
          </Button>
        </div>
      </UploaderGate>

      {/* Content Manager Navigation (Uploader + Moderator permissions) */}
      <ContentManagerGate>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/moderate">
              <Shield className="mr-2 h-4 w-4" />
              Moderate Content
            </a>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </a>
          </Button>
        </div>
      </ContentManagerGate>

      {/* Moderator Navigation */}
      <ModeratorGate>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/reports">
              <MessageSquare className="mr-2 h-4 w-4" />
              Reports
            </a>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/flagged-content">
              <Shield className="mr-2 h-4 w-4" />
              Flagged Content
            </a>
          </Button>
        </div>
      </ModeratorGate>

      {/* Admin Navigation */}
      <AdminGate>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/admin">
              <Settings className="mr-2 h-4 w-4" />
              Admin Dashboard
            </a>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </a>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/system">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </a>
          </Button>
        </div>
      </AdminGate>

      {/* Photo Upload Permission (for users who can upload but aren't uploaders) */}
      <PhotoUploadGate>
        {!hasRole('uploader') && (
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </a>
          </Button>
        )}
      </PhotoUploadGate>
    </div>
  );
};

export default RoleBasedNav; 