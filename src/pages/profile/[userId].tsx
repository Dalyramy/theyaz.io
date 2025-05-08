import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePhotos from '@/components/profile/ProfilePhotos';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { userId } = useParams();
  if (!userId) return <div>User not found.</div>;
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <ProfileHeader userId={userId} />
      <ProfilePhotos userId={userId} />
    </div>
  );
};

export default ProfilePage; 