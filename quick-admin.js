// Quick admin user creation script
// Run this: node quick-admin.js

import { createClient } from '@supabase/supabase-js';

// Your Supabase URL (replace with your actual URL)
const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';

// You need to get this from Supabase Dashboard > Settings > API > service_role key
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace this!

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createQuickAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@theyaz.io',
      password: 'admin123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Error creating user:', authError.message);
      console.log('\n💡 If you get a service key error, you need to:');
      console.log('1. Go to Supabase Dashboard > Settings > API');
      console.log('2. Copy the "service_role" key');
      console.log('3. Replace YOUR_SERVICE_ROLE_KEY_HERE in this script');
      return;
    }
    
    const userId = authData.user.id;
    console.log('✅ User created:', userId);
    
    // Set admin flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (profileError) {
      console.error('❌ Error setting admin flag:', profileError.message);
      return;
    }
    
    console.log('✅ Admin flag set');
    
    // Assign admin role
    const { data: adminRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (adminRole) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: adminRole.id,
          assigned_by: userId
        });
      console.log('✅ Admin role assigned');
    }
    
    console.log('\n🎉 ADMIN USER CREATED!');
    console.log('📧 Email: admin@theyaz.io');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', userId);
    console.log('\n💡 You can now log in to your app!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Manual steps:');
    console.log('1. Go to Supabase Studio > Authentication > Users');
    console.log('2. Create a user manually');
    console.log('3. Copy the user ID');
    console.log('4. Go to SQL Editor and run:');
    console.log('   UPDATE profiles SET is_admin = true WHERE id = \'USER_ID\';');
  }
}

createQuickAdmin(); 