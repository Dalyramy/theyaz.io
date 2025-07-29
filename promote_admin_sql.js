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

async function promoteToAdminSQL() {
  try {
    console.log('🔍 Promoting ramydaly0 to admin using SQL...\n');

    // First, find the user to get their ID
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
    console.log(`   Current Admin Status: ${user.is_admin}`);
    console.log('');

    if (user.is_admin === true) {
      console.log('⚠️  User is already an admin!');
      return;
    }

    // Use raw SQL to update the user to admin
    const { data: updateResult, error: updateError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          UPDATE public.profiles 
          SET is_admin = true, updated_at = NOW()
          WHERE id = '${user.id}';
        `
      });

    if (updateError) {
      console.error('❌ Error updating user to admin:', updateError);
      
      // Try alternative approach with direct SQL
      console.log('🔄 Trying alternative SQL approach...');
      const { error: altError } = await supabase
        .from('profiles')
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (altError) {
        console.error('❌ Alternative approach also failed:', altError);
        return;
      }
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
      console.log(`   ID: ${checkUser.id}`);
      console.log(`   Username: ${checkUser.username}`);
      console.log(`   Is Admin: ${checkUser.is_admin}`);
      console.log(`   Updated At: ${checkUser.updated_at}`);
      
      if (checkUser.is_admin === true) {
        console.log('🎉 SUCCESS: User has been promoted to admin!');
      } else {
        console.log('❌ FAILED: User is still not an admin');
        console.log('💡 This might be due to Row Level Security (RLS) policies.');
        console.log('💡 You may need to use the Supabase dashboard or service role key.');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the promotion
promoteToAdminSQL(); 