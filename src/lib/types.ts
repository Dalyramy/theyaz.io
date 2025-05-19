export interface Like {
  id: string;
  user_id: string;
  photo_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  photo_id: string;
  user_profile?: {
    username: string;
    avatar_url: string;
  };
  likes?: number;
}

// Add type declarations for global objects added by third-party scripts
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}
