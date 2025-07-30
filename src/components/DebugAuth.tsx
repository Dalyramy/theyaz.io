import { useAuth } from '@/contexts/AuthContext';

export default function DebugAuth() {
  const { user, isAdmin, isLoading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
      <h3 className="font-bold mb-2">Debug Auth State</h3>
      <div className="space-y-1">
        <div>User: {user?.email || 'None'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>isAdmin: {isAdmin.toString()}</div>
        <div>Loading: {isLoading.toString()}</div>
      </div>
    </div>
  );
} 