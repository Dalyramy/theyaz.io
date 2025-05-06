
import { useState, useEffect } from 'react';
import { loadScript, LoadingState, extractInstagramUsername } from '@/lib/socialEmbedUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface InstagramEmbedProps {
  postUrl: string;
  caption?: string;
  className?: string;
  maxWidth?: number;
}

const InstagramEmbed = ({ 
  postUrl, 
  caption, 
  className = '',
  maxWidth = 540
}: InstagramEmbedProps) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    isError: false,
  });
  
  const username = extractInstagramUsername(postUrl);

  useEffect(() => {
    if (!postUrl) {
      setState({ isLoading: false, isError: true, errorMessage: 'No Instagram post URL provided' });
      return;
    }

    setState({ isLoading: true, isError: false });
    
    try {
      const loadInstagramEmbed = () => {
        // @ts-ignore - window.instgrm is added by the Instagram script
        if (window.instgrm) {
          // @ts-ignore
          window.instgrm.Embeds.process();
          setState({ isLoading: false, isError: false });
        } else {
          setState({ isLoading: false, isError: true, errorMessage: 'Failed to load Instagram embed script' });
        }
      };

      loadScript(
        'instagram-embed-script',
        '//www.instagram.com/embed.js',
        loadInstagramEmbed
      );
    } catch (error) {
      console.error('Error loading Instagram embed:', error);
      setState({ isLoading: false, isError: true, errorMessage: 'Failed to load Instagram embed' });
    }

    return () => {
      // Cleanup if needed
    };
  }, [postUrl]);

  if (state.isError) {
    return (
      <div className={`instagram-embed-error p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-950/20 dark:border-red-800 ${className}`}>
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load Instagram post: {state.errorMessage}</p>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Post URL: {postUrl}</p>
      </div>
    );
  }

  return (
    <div className={`instagram-embed-container ${className}`}>
      {state.isLoading && (
        <div className="animate-pulse">
          <Skeleton className="h-[450px] w-full max-w-[540px] mx-auto rounded" />
        </div>
      )}
      
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={postUrl}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '1px',
          maxWidth: `${maxWidth}px`,
          minWidth: '326px',
          padding: 0,
          width: '99.375%',
        }}
      >
        {caption && (
          <div className="py-4 px-2 text-sm text-gray-500">{caption}</div>
        )}
        {username && (
          <div className="py-2 text-sm text-gray-400">
            View this post on {username}'s Instagram
          </div>
        )}
      </blockquote>
    </div>
  );
};

export default InstagramEmbed;
