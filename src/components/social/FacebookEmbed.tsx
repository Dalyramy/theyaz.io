import { useState, useEffect } from 'react';
import { loadScript, LoadingState } from '@/lib/socialEmbedUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface FacebookEmbedProps {
  postUrl: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
  caption?: string;
}

const FacebookEmbed = ({ 
  postUrl, 
  width = 500, 
  height = 500, 
  showText = true, 
  className = '',
  caption
}: FacebookEmbedProps) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    if (!postUrl) {
      setState({ isLoading: false, isError: true, errorMessage: 'No Facebook post URL provided' });
      return;
    }

    setState({ isLoading: true, isError: false });
    
    try {
      const loadFacebookSDK = () => {
        if (window.FB) {
          window.FB.XFBML.parse();
          setState({ isLoading: false, isError: false });
        } else {
          setState({ isLoading: false, isError: true, errorMessage: 'Failed to load Facebook SDK' });
        }
      };

      loadScript(
        'facebook-jssdk',
        'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0',
        loadFacebookSDK
      );
    } catch (error) {
      console.error('Error loading Facebook embed:', error);
      setState({ isLoading: false, isError: true, errorMessage: 'Failed to load Facebook embed' });
    }

    return () => {
      // Cleanup if needed
    };
  }, [postUrl]);

  if (state.isError) {
    return (
      <div className={`facebook-embed-error p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-950/20 dark:border-red-800 ${className}`}>
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load Facebook post: {state.errorMessage}</p>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Post URL: {postUrl}</p>
      </div>
    );
  }

  return (
    <div className={`facebook-embed-container ${className}`}>
      {state.isLoading && (
        <div className="animate-pulse">
          <Skeleton className="h-[400px] w-full rounded" />
        </div>
      )}
      
      {caption && (
        <div className="py-2 px-1 text-sm text-muted-foreground">{caption}</div>
      )}
      
      <div 
        className="fb-post" 
        data-href={postUrl}
        data-width={width}
        data-show-text={showText}
      ></div>
    </div>
  );
};

export default FacebookEmbed;
