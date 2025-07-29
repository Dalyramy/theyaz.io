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

async function promoteToAdmin() {
  try {
    console.log('🔍 Looking for user: ramydaly0...\n');

    // First, find the user
    const { data: user, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'ramydaly0')
      .single();

    if (findError) {
      console.error('❌ Error finding user:', findError);
      return;
    }

    if (!user) {
      console.log('❌ User "ramydaly0" not found in the database.');
      return;
    }

    console.log('✅ Found user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Full Name: ${user.full_name}`);
    console.log(`   Current Admin Status: ${user.is_admin}`);
    console.log('');

    if (user.is_admin === true) {
      console.log('⚠️  User is already an admin!');
      return;
    }

    // Update the user to admin using the user's ID
    const { data: updatedUsers, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating user to admin:', updateError);
      return;
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      console.log('❌ No rows were updated. User might not exist or update failed.');
      return;
    }

    const updatedUser = updatedUsers[0];

    console.log('🎉 Successfully promoted user to admin!');
    console.log('✅ Updated user details:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Full Name: ${updatedUser.full_name}`);
    console.log(`   New Admin Status: ${updatedUser.is_admin}`);
    console.log(`   Updated At: ${updatedUser.updated_at}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the promotion
promoteToAdmin(); 