import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import ProfileStats from './ProfileStats';
import EditProfileModal from './EditProfileModal';
import { useAuth } from '@/contexts/AuthContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

const ProfileHeader = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
      <img
                    src={profile.avatar_url || '/icons/default-avatar.svg'}
        alt="Avatar"
        className="w-20 h-20 rounded-full object-cover border"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{profile.username || 'Unnamed User'}</h2>
          {user && user.id === userId && (
            <button
              className="ml-2 px-3 py-1 rounded bg-primary text-white"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </button>
          )}
        </div>
        {profile.bio && <p className="text-gray-500">{profile.bio}</p>}
        <ProfileStats userId={userId} />
      </div>
      {profile && (
        <EditProfileModal
          profile={profile}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onProfileUpdated={setProfile}
        />
      )}
    </div>
  );
};

export default ProfileHeader; 