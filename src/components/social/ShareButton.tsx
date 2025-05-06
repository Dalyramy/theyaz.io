import { useState } from 'react';
import { Share2, Copy, Twitter, Facebook } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const ShareButton = ({
  url,
  title,
  description = '',
  className = '',
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'The link has been copied to your clipboard.',
      });
      setError(null);
    } catch (error) {
      setError('Failed to copy link. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to copy link. Please try again.',
        variant: 'destructive',
      });
    }
    setIsOpen(false);
  };

  const handleShare = async (platform: 'twitter' | 'facebook') => {
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
    };

    try {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setError(null);
    } catch (error) {
      setError(`Failed to share on ${platform}. Please try again.`);
      toast({
        title: 'Error',
        description: `Failed to share on ${platform}. Please try again.`,
        variant: 'destructive',
      });
    }
    setIsOpen(false);
  };

  // Use Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast({
          title: 'Shared successfully',
          description: 'The content has been shared.',
        });
        setError(null);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setError('Failed to share. Please try again.');
          toast({
            title: 'Error',
            description: 'Failed to share. Please try again.',
            variant: 'destructive',
          });
        }
      }
    }
    return false;
  };

  const handleShareClick = async () => {
    const shared = await handleNativeShare();
    if (!shared) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={handleShareClick}
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleShare('twitter')}
            className="gap-2"
          >
            <Twitter className="h-4 w-4" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleShare('facebook')}
            className="gap-2"
          >
            <Facebook className="h-4 w-4" />
            Share on Facebook
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ShareButton; 