// Promote an existing user to admin
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promoteToAdmin(email) {
  try {
    // Get user by email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    if (userError || !userData) {
      console.error('❌ Error fetching users:', userError?.message);
      return;
    }
    const user = userData.users.find(u => u.email === email);
    if (!user) {
      console.error('❌ User not found with email:', email);
      return;
    }
    const userId = user.id;
    // Set is_admin flag in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
      return;
    }
    // Get admin role ID
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    if (roleError || !adminRole) {
      console.error('❌ Error fetching admin role:', roleError?.message);
      return;
    }
    // Assign admin role
    const { error: roleAssignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: adminRole.id,
        assigned_by: userId
      }, { upsert: true });
    if (roleAssignError) {
      console.error('❌ Error assigning admin role:', roleAssignError.message);
      return;
    }
    console.log(`🎉 User ${email} promoted to admin!`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/create-admin.js <email>');
  process.exit(1);
}
promoteToAdmin(email); 