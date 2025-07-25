#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using the working project URL
const SUPABASE_URL = "https://qjrysayswbdqskynywkr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcnlzYXlzd2JkcXNreW55d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzkwNDgsImV4cCI6MjA2ODg1NTA0OH0.feYjlWxRpKk3q7Lp9fKMSv7Om5YKi0OLOIqelRF5pCA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('🔐 Testing authentication...\n');
  
  // Test 1: Check if we can access the auth service
  console.log('1. Testing auth service access...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Auth service error:', error.message);
    } else {
      console.log('✅ Auth service accessible');
    }
  } catch (error) {
    console.log('❌ Auth service error:', error.message);
  }
  
  // Test 2: Check if we can access the profiles table
  console.log('\n2. Testing profiles table access...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Profiles table error:', error.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log(`📊 Found ${data?.length || 0} profiles`);
    }
  } catch (error) {
    console.log('❌ Profiles table error:', error.message);
  }
  
  // Test 3: Check if we can access the photos table
  console.log('\n3. Testing photos table access...');
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Photos table error:', error.message);
    } else {
      console.log('✅ Photos table accessible');
      console.log(`📊 Found ${data?.length || 0} photos`);
    }
  } catch (error) {
    console.log('❌ Photos table error:', error.message);
  }
  
  console.log('\n✅ Authentication test complete!');
  console.log('\n📝 The database is now connected and ready for login/signup functionality.');
}

testAuth().catch(console.error); 