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

async function debugUserUpdate() {
  try {
    console.log('🔍 Debugging user update for: ramydaly0...\n');

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
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Updated: ${user.updated_at}`);
    console.log('');

    // Try update without returning data first
    console.log('🔄 Attempting update without returning data...');
    const { error: updateError1 } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError1) {
      console.error('❌ Error in update attempt 1:', updateError1);
    } else {
      console.log('✅ Update attempt 1 completed without error');
    }

    // Check if the update worked
    const { data: checkUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'ramydaly0')
      .single();

    if (checkError) {
      console.error('❌ Error checking updated user:', checkError);
    } else {
      console.log('📊 User status after update:');
      console.log(`   Is Admin: ${checkUser.is_admin}`);
      console.log(`   Updated At: ${checkUser.updated_at}`);
      
      if (checkUser.is_admin === true) {
        console.log('🎉 SUCCESS: User has been promoted to admin!');
      } else {
        console.log('❌ FAILED: User is still not an admin');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugUserUpdate(); 