// Verification script for RBAC system
// Run this to check if everything is set up correctly

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRBAC() {
  console.log('🔍 Verifying RBAC System...\n');

  try {
    // Check if roles table exists and has data
    console.log('1. Checking roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      return;
    }

    console.log(`✅ Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`   - ${role.name}: ${role.description}`);
    });

    // Check if permissions table exists and has data
    console.log('\n2. Checking permissions table...');
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
      .order('name');

    if (permissionsError) {
      console.error('❌ Error fetching permissions:', permissionsError);
      return;
    }

    console.log(`✅ Found ${permissions.length} permissions:`);
    permissions.forEach(permission => {
      console.log(`   - ${permission.name} (${permission.resource}.${permission.action})`);
    });

    // Check if role_permissions table has data
    console.log('\n3. Checking role_permissions table...');
    const { data: rolePermissions, error: rpError } = await supabase
      .from('role_permissions')
      .select('*');

    if (rpError) {
      console.error('❌ Error fetching role permissions:', rpError);
      return;
    }

    console.log(`✅ Found ${rolePermissions.length} role-permission assignments`);

    // Check if functions exist
    console.log('\n4. Checking database functions...');
    const { data: functions, error: funcError } = await supabase
      .rpc('get_user_permissions', { user_uuid: '00000000-0000-0000-0000-000000000000' });

    if (funcError && funcError.code === '42883') {
      console.error('❌ Function get_user_permissions not found');
    } else {
      console.log('✅ Function get_user_permissions exists');
    }

    // Check RLS policies
    console.log('\n5. Checking Row Level Security...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['roles', 'permissions', 'role_permissions', 'user_roles']);

    if (policiesError) {
      console.error('❌ Error checking RLS policies:', policiesError);
    } else {
      console.log(`✅ Found ${policies.length} RLS policies`);
    }

    console.log('\n🎉 RBAC System Verification Complete!');
    console.log('\nNext steps:');
    console.log('1. Create an admin user (see instructions above)');
    console.log('2. Test the system at http://localhost:5173/rbac-test');
    console.log('3. Try the admin dashboard at http://localhost:5173/admin');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyRBAC(); 