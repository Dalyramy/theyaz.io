import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

interface UserProfileLinkProps {
  user: {
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
}

const UserProfileLink = ({
  user,
  className = '',
  avatarClassName = 'h-8 w-8',
  nameClassName = 'font-medium',
}: UserProfileLinkProps) => {
  if (!user?.username) return null;
  return (
    <Link
      to={`/profile/${user.username}`}
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      <Avatar className={avatarClassName}>
        <AvatarImage src={user.avatar_url} alt={user.username} />
        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className={nameClassName}>{user.full_name || user.username}</span>
    </Link>
  );
};

export default UserProfileLink; 