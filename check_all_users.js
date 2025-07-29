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

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users in the database...\n');

    // Query all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in the database.');
      return;
    }

    console.log(`✅ Found ${users.length} total user(s):\n`);

    // Count admins and regular users
    const admins = users.filter(user => user.is_admin === true);
    const regularUsers = users.filter(user => user.is_admin !== true);

    console.log(`👑 Admin users: ${admins.length}`);
    console.log(`👤 Regular users: ${regularUsers.length}`);
    console.log('');

    // Display all users with their admin status
    users.forEach((user, index) => {
      const adminBadge = user.is_admin ? '👑 ADMIN' : '👤 USER';
      console.log(`${index + 1}. ${adminBadge}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username || 'Not set'}`);
      console.log(`   Full Name: ${user.full_name || 'Not set'}`);
      console.log(`   Avatar URL: ${user.avatar_url || 'Not set'}`);
      console.log(`   Bio: ${user.bio || 'Not set'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Updated: ${user.updated_at}`);
      console.log(`   Is Admin: ${user.is_admin}`);
      console.log('');
    });

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Admin users: ${admins.length}`);
    console.log(`   Regular users: ${regularUsers.length}`);
    console.log(`   Admin percentage: ${((admins.length / users.length) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkAllUsers(); 