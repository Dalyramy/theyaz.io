import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import UserProfileLink from '@/components/ui/UserProfileLink';
import type { Database } from '@/integrations/supabase/types';

interface FollowingListProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Type for the joined follow+profile result
interface FollowWithProfile {
  followed_user_id: string;
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'avatar_url' | 'full_name'>;
}

const FollowingList = ({ userId, isOpen, onClose }: FollowingListProps) => {
  const [following, setFollowing] = useState<FollowWithProfile[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    supabase
      .from('follows')
      .select('followed_user_id, profiles:followed_user_id(id, username, avatar_url)')
      .eq('user_id', userId)
      .then(({ data }) => setFollowing(data || []));
  }, [userId, isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Following</h2>
        <ul>
          {following.map(f => (
            <li key={f.followed_user_id} className="flex items-center gap-2 mb-2">
              <UserProfileLink user={f.profiles} avatarClassName="w-8 h-8" nameClassName="" />
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 px-4 py-1 rounded bg-gray-300">Close</button>
      </div>
    </div>
  );
};
export default FollowingList; 