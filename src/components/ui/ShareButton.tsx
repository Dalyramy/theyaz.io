import { Share2, Copy, Twitter } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface ShareButtonProps {
  photoId: string;
  photoUrl: string;
}

export function ShareButton({ photoId, photoUrl }: ShareButtonProps) {
  const shareUrl = `${window.location.origin}/photo/${photoId}`;

  const shareOptions = [
    {
      name: 'Copy link',
      icon: Copy,
      onClick: handleCopyLink,
    },
    {
      name: 'Share on Twitter',
      icon: Twitter,
      onClick: () => handleShare('twitter'),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Share2 className="h-5 w-5" />
          <span className="text-sm">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={option.action}
            className="cursor-pointer"
          >
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 