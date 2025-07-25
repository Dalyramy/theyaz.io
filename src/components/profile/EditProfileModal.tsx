import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface EditProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: Profile) => void;
}

const EditProfileModal = ({ profile, isOpen, onClose, onProfileUpdated }: EditProfileModalProps) => {
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}.${fileExt}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ username, bio, avatar_url: avatarUrl })
      .eq('id', profile.id)
      .select()
      .single();
    setLoading(false);
    if (!error && data) {
      onProfileUpdated(data);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <label className="block mb-2">
          Username
          <input
            className="w-full border rounded px-2 py-1 mt-1"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </label>
        <label className="block mb-2">
          Bio
          <textarea
            className="w-full border rounded px-2 py-1 mt-1"
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </label>
        <label className="block mb-4">
          Avatar
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="block mt-1" />
          {avatarUrl && (
            <picture>
              <source srcSet={avatarUrl.replace(/\.(jpg|jpeg|png|svg)$/i, '.webp')} type="image/webp" />
              <img src={avatarUrl} className="w-16 h-16 rounded-full mt-2" loading="lazy" alt="User avatar" />
            </picture>
          )}
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 rounded bg-gray-300">Cancel</button>
          <button onClick={handleSave} className="px-4 py-1 rounded bg-primary text-white" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal; 