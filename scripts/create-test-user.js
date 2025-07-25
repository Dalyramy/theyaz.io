#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = "https://qjrysayswbdqskynywkr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcnlzYXlzd2JkcXNreW55d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzkwNDgsImV4cCI6MjA2ODg1NTA0OH0.feYjlWxRpKk3q7Lp9fKMSv7Om5YKi0OLOIqelRF5pCA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUser() {
  console.log('🔐 Creating test user...\n');
  
  const testEmail = 'demo@theyaz.io';
  const testPassword = 'demo123';
  
  try {
    // Create user through Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'demo',
          full_name: 'Demo User'
        }
      }
    });
    
    if (error) {
      console.log('❌ Error creating user:', error.message);
      
      // If user already exists, try to sign in to verify
      console.log('\n🔄 User might already exist, testing sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message);
      } else {
        console.log('✅ User exists and can sign in!');
        console.log('📧 Email:', testEmail);
        console.log('🔑 Password:', testPassword);
      }
    } else {
      console.log('✅ Test user created successfully!');
      console.log('📧 Email:', testEmail);
      console.log('🔑 Password:', testPassword);
      
      // Check if profile was created
      if (data.user) {
        console.log('👤 User ID:', data.user.id);
        
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.log('⚠️ Profile not found, but user created');
        } else {
          console.log('✅ Profile created automatically');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
  
  console.log('\n🎯 Try logging in with:');
  console.log('📧 Email: demo@theyaz.io');
  console.log('🔑 Password: demo123');
}

createTestUser().catch(console.error); 