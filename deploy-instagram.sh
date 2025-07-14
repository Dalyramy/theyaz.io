#!/bin/bash

# Instagram Integration Deployment Script
# This script helps deploy the Instagram integration to production

echo "🚀 Starting Instagram Integration Deployment..."

# Step 1: Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Apply database migrations
echo "🗄️ Applying database migrations..."
npx supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed!"
    echo "Please run 'npx supabase db push' manually and enter your password."
    exit 1
fi

echo "✅ Database migrations applied successfully!"

# Step 3: Generate updated types
echo "🔧 Generating updated TypeScript types..."
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

echo "✅ TypeScript types updated!"

# Step 4: Run tests (if available)
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🧪 Running tests..."
    npm test
    echo "✅ Tests completed!"
fi

# Step 5: Deploy to production
echo "🌐 Deploying to production..."
echo "Please deploy the dist folder to your hosting provider (Hostinger)"

echo ""
echo "🎉 Instagram Integration Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy the dist folder to Hostinger"
echo "2. Test the Instagram integration at: https://theyaz.io/instagram-test"
echo "3. Create test photos with Instagram post IDs"
echo "4. Verify Instagram embeds are working correctly"
echo ""
echo "🔗 Test URL: https://theyaz.io/instagram-test" 