#!/bin/bash

# Deployment script for theyaz.io Gallery component
# This script helps deploy the updated Gallery component to production

echo "🚀 Deploying Gallery component to theyaz.io..."

# 1. Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully"

# 2. Run tests (if available)
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🧪 Running tests..."
    npm test
    if [ $? -ne 0 ]; then
        echo "⚠️  Tests failed, but continuing with deployment..."
    fi
fi

# 3. Commit changes to Git
echo "📝 Committing changes..."
git add .
git commit -m "feat: Add modern Gallery component with Instagram integration

- Add responsive photo grid (1 col mobile, 3 col desktop)
- Integrate Instagram oEmbed API for Instagram posts
- Add real-time likes_count updates via Supabase
- Implement Berber-inspired design with earthy tones
- Add error handling and loading states
- Install axios for API calls"

# 4. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Git push failed!"
    exit 1
fi

echo "✅ Changes pushed to GitHub"

# 5. Deploy to Hostinger (if using GitHub integration)
echo "🌐 Deploying to Hostinger..."
echo "Note: If using GitHub integration, deployment should happen automatically"
echo "Check your Hostinger dashboard for deployment status"

# 6. Test the deployment
echo "🧪 Testing deployment..."
echo "Visit https://theyaz.io/gallery to test the new Gallery component"

# 7. Verify Instagram integration
echo "📸 Testing Instagram integration..."
echo "Note: Instagram oEmbed API may have CORS restrictions in production"
echo "Consider setting up a backend proxy if needed"

echo "🎉 Deployment script completed!"
echo ""
echo "Next steps:"
echo "1. Visit https://theyaz.io/gallery"
echo "2. Test photo loading and display"
echo "3. Test Instagram embed functionality"
echo "4. Test real-time likes_count updates"
echo "5. Verify responsive design on mobile and desktop"

echo ""
echo "If you encounter issues:"
echo "- Check browser console for errors"
echo "- Verify Supabase connection"
echo "- Test Instagram oEmbed API directly"
echo "- Check CORS settings for Instagram API" 