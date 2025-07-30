import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FollowersList from './FollowersList';
import FollowingList from './FollowingList';

interface ProfileStatsProps {
  userId: string;
}

const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_user_id', userId);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: photoCountValue } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setFollowers(followersCount || 0);
      setFollowing(followingCount || 0);
      setPhotoCount(photoCountValue || 0);

      if (user && user.id !== userId) {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('user_id', user.id)
          .eq('followed_user_id', userId)
          .single();
        setIsFollowing(!!data);
      }
    }
    fetchStats();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user) return;
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('user_id', user.id)
        .eq('followed_user_id', userId);
      setIsFollowing(false);
      setFollowers(f => f - 1);
    } else {
      await supabase
        .from('follows')
        .insert({ user_id: user.id, followed_user_id: userId });
      setIsFollowing(true);
      setFollowers(f => f + 1);
    }
  };

  return (
    <div className="flex items-center gap-6 mt-2">
      <div>
        <span className="font-bold">{photoCount}</span> Photos
      </div>
      <div>
        <button onClick={() => setFollowersOpen(true)}>
          <span className="font-bold">{followers}</span> Followers
        </button>
      </div>
      <div>
        <button onClick={() => setFollowingOpen(true)}>
          <span className="font-bold">{following}</span> Following
        </button>
      </div>
      {user && user.id !== userId && (
        <button
          onClick={handleFollow}
          className={`ml-4 px-4 py-1 rounded-full text-white ${isFollowing ? 'bg-gray-400' : 'bg-primary'}`}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}
      <FollowersList userId={userId} isOpen={followersOpen} onClose={() => setFollowersOpen(false)} />
      <FollowingList userId={userId} isOpen={followingOpen} onClose={() => setFollowingOpen(false)} />
    </div>
  );
};

export default ProfileStats; 