import { Share2 } from 'lucide-react';
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
      name: 'Copy Link',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
      },
    },
    {
      name: 'Share on Facebook',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`,
          '_blank'
        );
      },
    },
    {
      name: 'Share on Twitter',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
      },
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