# 🚀 imgix Setup Guide for theyaz.io

This guide will help you set up imgix image optimization for your theyaz.io photo gallery.

## **Step 1: Get Supabase Storage Credentials**

### 1.1 Access Your Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `rkdpcovnrrtlkcxzolxl`
3. Navigate to **Settings → API**

### 1.2 Get Storage Information
Look for the **Storage** section and note down:
- **Project URL**: `https://rkdpcovnrrtlkcxzolxl.supabase.co`
- **Storage Bucket**: `photos`
- **Region**: Usually `us-east-1` for Supabase

### 1.3 Get S3-Compatible Credentials
You'll need to get the S3-compatible credentials. These are typically found in:
- **Settings → API → Storage** section
- Or contact Supabase support if not visible

## **Step 2: Create imgix Source**

### 2.1 Go to imgix Dashboard
1. Visit [https://dashboard.imgix.com/sources/new](https://dashboard.imgix.com/sources/new)
2. You should see the "Where does your media live?" page

### 2.2 Select Storage Provider
1. Choose **"AWS Amazon S3"** (Supabase uses S3-compatible storage)
2. Click **"Continue"**

### 2.3 Enter Your Credentials
Fill in the form with your Supabase storage details:

```
Source Name: theyaz-photos
Access Key ID: [from Supabase dashboard]
Secret Access Key: [from Supabase dashboard]
Bucket: photos
Region: [from Supabase dashboard]
```

### 2.4 Complete Setup
1. Click **"Create Source"**
2. Wait for imgix to connect to your storage
3. Note your **imgix domain** (e.g., `https://your-subdomain.imgix.net`)

## **Step 3: Update Your Code**

### 3.1 Update imgix Domain
Edit `src/lib/imgix.ts` and replace the placeholder:

```typescript
const IMGIX_DOMAIN = 'your-actual-subdomain.imgix.net'; // Replace with your actual domain
```

### 3.2 Test the Integration
The code is already updated to use imgix optimization. Test by:

1. **Upload a new photo** to your gallery
2. **Check the network tab** in browser dev tools
3. **Verify** that images are being served from imgix domain

## **Step 4: Environment Variables (Optional)**

Add imgix configuration to your `.env.local`:

```env
# imgix Configuration
VITE_IMGIX_DOMAIN=your-subdomain.imgix.net
VITE_IMGIX_ENABLED=true
```

## **Step 5: Verify Setup**

### 5.1 Check Image URLs
Your images should now be served from imgix with optimization parameters:

**Before (Supabase):**
```
https://rkdpcovnrrtlkcxzolxl.supabase.co/storage/v1/object/public/photos/user-id/image.jpg
```

**After (imgix):**
```
https://your-subdomain.imgix.net/user-id/image.jpg?w=800&h=600&fit=crop&auto=format,compress&q=85
```

### 5.2 Test Different Optimizations
The code includes several optimization presets:

- **Thumbnails**: 300x300, face-cropped
- **Gallery**: 800x600, cropped
- **Hero**: 1200x800, high quality
- **WebP**: Modern format for better compression
- **AVIF**: Latest format for maximum compression

## **Step 6: Benefits You'll See**

### 6.1 Performance Improvements
- **Faster loading**: Optimized image formats (WebP, AVIF)
- **Reduced bandwidth**: Automatic compression
- **Better caching**: CDN distribution worldwide

### 6.2 Quality Enhancements
- **Automatic optimization**: Format, compression, enhancement
- **Responsive images**: Different sizes for different devices
- **Face detection**: Smart cropping for portraits

### 6.3 Developer Experience
- **URL-based transformations**: No server-side processing needed
- **Real-time optimization**: Changes applied instantly
- **Analytics**: Track image performance

## **Step 7: Troubleshooting**

### 7.1 Common Issues

**Images not loading from imgix:**
- Check your imgix domain is correct
- Verify Supabase credentials are working
- Ensure bucket permissions are set correctly

**Original images still showing:**
- Clear browser cache
- Check if imgix domain is properly configured
- Verify the URL parsing in `src/lib/imgix.ts`

### 7.2 Debug Steps
1. **Check browser network tab** for image requests
2. **Verify imgix domain** in your code
3. **Test direct imgix URLs** in browser
4. **Check Supabase storage** permissions

## **Step 8: Advanced Configuration**

### 8.1 Custom Optimizations
You can add custom optimization presets in `src/lib/imgix.ts`:

```typescript
// Add to imgixOptimizations object
custom: (url: string) => optimizeImage(url, {
  w: 1200,
  h: 800,
  fit: 'crop',
  crop: 'faces',
  auto: 'format,compress,enhance',
  q: 90,
  sat: 10,
  con: 5
})
```

### 8.2 Responsive Images
Use the `generateSrcSet` function for responsive images:

```typescript
const srcSet = generateSrcSet(imageUrl, [400, 800, 1200, 1600]);
// Returns: "url1 400w, url2 800w, url3 1200w, url4 1600w"
```

## **Step 9: Deployment**

### 9.1 Update Environment Variables
Add your imgix domain to your Vercel environment variables:

1. Go to your Vercel dashboard
2. Select your theyaz.io project
3. Go to **Settings → Environment Variables**
4. Add:
   - `VITE_IMGIX_DOMAIN`: your imgix domain
   - `VITE_IMGIX_ENABLED`: true

### 9.2 Deploy Changes
```bash
git add .
git commit -m "feat: integrate imgix image optimization"
git push origin main
```

## **Step 10: Monitor Performance**

### 10.1 Check imgix Analytics
1. Go to your imgix dashboard
2. Check **Analytics** section
3. Monitor bandwidth savings and performance

### 10.2 Browser Performance
Use browser dev tools to check:
- **Network tab**: Image loading times
- **Performance tab**: Overall page performance
- **Lighthouse**: Image optimization scores

## **🎉 You're Done!**

Your theyaz.io site now has:
- ✅ **Automatic image optimization**
- ✅ **Responsive image delivery**
- ✅ **Modern format support** (WebP, AVIF)
- ✅ **Global CDN distribution**
- ✅ **Real-time transformations**

Your users will experience faster loading times and better image quality! 🚀