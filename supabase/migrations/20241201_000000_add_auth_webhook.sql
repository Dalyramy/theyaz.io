-- Create a function to handle webhooks for auth events
CREATE OR REPLACE FUNCTION public.handle_new_user_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the webhook with the user data
  PERFORM net.http_post(
    url := 'https://bkbqkpfzrqykrzzvzyrg.functions.supabase.co/handle-new-user',
    body := json_build_object('type', TG_OP, 'record', row_to_json(NEW)),
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYnFrcGZ6cnF5a3J6enZ6eXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzk5OTksImV4cCI6MjA2MTcxNTk5OX0.7wLFlI5VFlBGyroUtZTBu2MyM1bPbpW01yAik-oNb5s"}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to call the webhook when a new user is created
CREATE OR REPLACE TRIGGER auth_new_user_webhook
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_webhook(); 