#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qjrysayswbdqskynywkr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcnlzYXlzd2JkcXNreW55d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzkwNDgsImV4cCI6MjA2ODg1NTA0OH0.feYjlWxRpKk3q7Lp9fKMSv7Om5YKi0OLOIqelRF5pCA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('🧪 Testing authentication...\n');
  
  // Test 1: Check if we can make a simple auth request
  console.log('1. Testing basic auth connection...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    });
    
    if (error) {
      console.log('✅ Auth service is working (expected error for wrong credentials)');
      console.log('📝 Error message:', error.message);
    } else {
      console.log('❌ Unexpected success with wrong credentials');
    }
  } catch (error) {
    console.log('❌ Auth service error:', error.message);
  }
  
  // Test 2: Check if we can access the database
  console.log('\n2. Testing database access...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database error:', error.message);
    } else {
      console.log('✅ Database access working');
    }
  } catch (error) {
    console.log('❌ Database error:', error.message);
  }
  
  console.log('\n🎯 The issue might be:');
  console.log('1. Email confirmation required in Supabase settings');
  console.log('2. Password policy requirements');
  console.log('3. Auth settings in Supabase dashboard');
  
  console.log('\n💡 Try this:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Check Authentication > Settings');
  console.log('3. Disable "Enable email confirmations" temporarily');
  console.log('4. Or create a user through the Supabase dashboard');
}

testAuth().catch(console.error); 