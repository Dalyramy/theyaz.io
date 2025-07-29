import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  try {
    console.log('🔍 Checking all admin users in the database...\n');

    // Query all admin users
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true);

    if (error) {
      console.error('❌ Error fetching admins:', error);
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('📭 No admin users found in the database.');
      return;
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Admin User:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username || 'Not set'}`);
      console.log(`   Full Name: ${admin.full_name || 'Not set'}`);
      console.log(`   Email: ${admin.email || 'Not available'}`);
      console.log(`   Avatar URL: ${admin.avatar_url || 'Not set'}`);
      console.log(`   Bio: ${admin.bio || 'Not set'}`);
      console.log(`   Created: ${admin.created_at}`);
      console.log(`   Updated: ${admin.updated_at}`);
      console.log(`   Is Admin: ${admin.is_admin}`);
      console.log('');
    });

    // Also check total user count for comparison
    const { data: allUsers, error: allUsersError } = await supabase
      .from('profiles')
      .select('id');

    if (!allUsersError) {
      console.log(`📊 Total users in database: ${allUsers.length}`);
      console.log(`📊 Admin percentage: ${((admins.length / allUsers.length) * 100).toFixed(2)}%`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkAdmins(); 