
// Social media embed utilities
export interface EmbedOptions {
  width?: number;
  height?: number;
  showCaption?: boolean;
  className?: string;
}

export enum EmbedType {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
}

export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

// Load social media scripts
export const loadScript = (
  id: string,
  src: string,
  callback: () => void
): void => {
  if (document.getElementById(id)) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  script.onerror = () => {
    console.error(`Failed to load script: ${src}`);
  };
  
  document.body.appendChild(script);
};

// Extract username from Instagram URL
export const extractInstagramUsername = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return pathParts[0];
    }
  } catch (e) {
    console.error('Invalid Instagram URL:', e);
  }
  return null;
};

// Extract post ID from Facebook URL
export const extractFacebookPostId = (url: string): string | null => {
  try {
    const regex = /\/posts\/(\d+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    console.error('Invalid Facebook URL:', e);
  }
  return null;
};
