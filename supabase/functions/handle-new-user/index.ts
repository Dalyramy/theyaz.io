// handle-new-user.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
serve(async (req)=>{
  // Create a Supabase client with the service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    // Get the request body
    const body = await req.json();
    // Extract user data from the webhook payload
    const { record: user, type } = body;
    // Only process new user events
    if (type !== 'INSERT') {
      return new Response(JSON.stringify({
        message: 'Not a new user event'
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Check if user exists
    if (!user || !user.id) {
      return new Response(JSON.stringify({
        message: 'Invalid user data'
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Extract user metadata
    const username = user.raw_user_meta_data?.username;
    const avatarUrl = user.raw_user_meta_data?.avatar_url;
    // Insert the user into the profiles table
    const { data, error } = await supabase.from('profiles').insert([
      {
        id: user.id,
        username: username || `user_${user.id.substring(0, 8)}`,
        avatar_url: avatarUrl
      }
    ]);
    if (error) {
      console.error('Error creating profile:', error);
      return new Response(JSON.stringify({
        message: 'Error creating profile',
        error
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    return new Response(JSON.stringify({
      message: 'Profile created successfully'
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({
      message: 'Error processing webhook',
      error
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
