import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Facebook } from "lucide-react";

export function FacebookSignInButton() {
  const handleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Error signing in with Facebook:', error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleSignIn}
      className="w-full flex items-center gap-2"
    >
      <Facebook className="h-5 w-5 text-blue-600" />
      Continue with Facebook
    </Button>
  );
} 