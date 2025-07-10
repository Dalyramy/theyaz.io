// Script to create an admin user
// Usage: node scripts/create-admin-user.js <email> <password>

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('💡 Get this from Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser(email, password) {
  try {
    console.log(`🔧 Creating admin user: ${email}`);
    
    // Step 1: Create the user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Error creating user:', authError.message);
      return;
    }
    
    const userId = authData.user.id;
    console.log(`✅ User created with ID: ${userId}`);
    
    // Step 2: Set is_admin flag in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
      return;
    }
    
    console.log('✅ Admin flag set in profiles table');
    
    // Step 3: Get admin role ID
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (roleError) {
      console.error('❌ Error fetching admin role:', roleError.message);
      return;
    }
    
    // Step 4: Assign admin role
    const { error: roleAssignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: adminRole.id,
        assigned_by: userId
      });
    
    if (roleAssignError) {
      console.error('❌ Error assigning admin role:', roleAssignError.message);
      return;
    }
    
    console.log('✅ Admin role assigned');
    console.log('\n🎉 Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\n💡 You can now log in to your app with these credentials');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node scripts/create-admin-user.js <email> <password>');
  console.log('Example: node scripts/create-admin-user.js admin@theyaz.io admin123');
  process.exit(1);
}

createAdminUser(email, password); 