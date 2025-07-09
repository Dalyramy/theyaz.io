// Script to create an admin user for RBAC testing
// Run this after applying the RBAC migration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    // First, create a user (this should be done through your app's signup)
    console.log('Creating admin user...');
    
    // Get the admin role ID
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (roleError) {
      console.error('Error fetching admin role:', roleError);
      return;
    }
    
    console.log('Admin role ID:', adminRole.id);
    
    // Note: You'll need to manually assign the admin role to a user
    // through the Supabase dashboard or your admin interface
    console.log('\nTo create an admin user:');
    console.log('1. Sign up a new user through your app');
    console.log('2. Go to Supabase Dashboard > Authentication > Users');
    console.log('3. Find the user and note their ID');
    console.log('4. Run this SQL in the SQL Editor:');
    console.log(`
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 'USER_ID_HERE', '${adminRole.id}', 'USER_ID_HERE'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'USER_ID_HERE' AND role_id = '${adminRole.id}'
);
    `);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser(); 