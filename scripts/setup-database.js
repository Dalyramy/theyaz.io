#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration - using the working project URL
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://qjrysayswbdqskynywkr.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcnlzYXlzd2JkcXNreW55d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzkwNDgsImV4cCI6MjA2ODg1NTA0OH0.feYjlWxRpKk3q7Lp9fKMSv7Om5YKi0OLOIqelRF5pCA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 Checking database tables...');
  
  const tables = ['profiles', 'photos', 'albums', 'categories', 'likes', 'comments'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' not found or accessible`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
    }
  }
}

async function createTestUser() {
  console.log('\n👤 Creating test user...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@theyaz.io',
      password: 'testpassword123',
      options: {
        data: {
          username: 'testuser',
          full_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.error('❌ Error creating test user:', error.message);
    } else {
      console.log('✅ Test user created successfully');
      console.log('📧 Check your email for verification');
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

async function main() {
  console.log('🚀 Setting up theyaz.io database...\n');
  
  // Test connection
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('\n❌ Database connection failed. Please check your Supabase configuration.');
    console.log('Make sure your Supabase project is set up and the schema is applied.');
    process.exit(1);
  }
  
  // Check tables
  await checkTables();
  
  // Create test user
  await createTestUser();
  
  console.log('\n✅ Database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Check your email for the test user verification');
  console.log('2. Try logging in with the test credentials');
  console.log('3. Verify that user profiles are created automatically');
}

main().catch(console.error); 