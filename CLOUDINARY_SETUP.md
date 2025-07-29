# Cloudinary Gallery Integration Setup

This guide will help you set up the Cloudinary gallery integration for your theyaz.io project.

## Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. After signing up, you'll get your Cloud Name, API Key, and API Secret
3. Note these credentials for the next step

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Existing Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.

## Step 3: Upload Images to Cloudinary

1. Log into your Cloudinary dashboard
2. Go to the Media Library
3. Create folders for organization (e.g., `gallery`, `portfolio`, `artwork`)
4. Upload your images to these folders

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/cloudinary-gallery` to see the gallery
3. Click on any image to view its details

## Step 5: Customize the Gallery

### Update Available Folders

Edit `src/pages/CloudinaryGallery.tsx` and modify the `availableFolders` array:

```typescript
const availableFolders = [
  { value: 'gallery', label: 'Main Gallery' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'artwork', label: 'Artwork' },
  { value: 'photography', label: 'Photography' },
  // Add your own folders here
];
```

### Customize Styling

The gallery uses Tailwind CSS classes. You can customize the appearance by modifying:

- `src/components/gallery/PhotoList.tsx` - Grid layout and hover effects
- `src/components/gallery/ImageDetail.tsx` - Image detail page styling
- `src/pages/CloudinaryGallery.tsx` - Main gallery page layout

## Step 6: Production Deployment

### For Vercel/Netlify

1. Add your environment variables to your deployment platform
2. Deploy your application
3. The gallery will work with your Cloudinary images

### For Docker

1. Update your `docker-compose.yml` to include environment variables
2. Build and deploy your Docker container

## Features Included

✅ **Responsive Grid Layout** - Works on all device sizes  
✅ **Image Search** - Search by filename or public ID  
✅ **Folder Organization** - Browse images by folders  
✅ **Sorting Options** - Sort by date, name, etc.  
✅ **Image Details** - View full image with metadata  
✅ **Navigation** - Navigate between images  
✅ **Download & Share** - Download original images and share links  
✅ **Loading States** - Smooth loading animations  
✅ **Error Handling** - Graceful error states  
✅ **Hover Effects** - Beautiful hover animations  

## Troubleshooting

### Images Not Loading

1. Check your Cloudinary credentials in `.env.local`
2. Verify your images are uploaded to the correct folders
3. Check the browser console for API errors

### CORS Issues

If you encounter CORS issues, you may need to:
1. Configure CORS settings in your Cloudinary account
2. Use a proxy server for API calls
3. Implement server-side Cloudinary integration

### Performance Issues

1. Enable Cloudinary's automatic optimization
2. Use appropriate image sizes and formats
3. Implement lazy loading for large galleries

## Next Steps

1. **Upload Widget**: Add a Cloudinary upload widget for users to upload images
2. **Pagination**: Implement pagination for large galleries
3. **Advanced Search**: Add filters by date, size, format, etc.
4. **Lightbox**: Implement a full-screen lightbox viewer
5. **Collections**: Create image collections and albums
6. **Analytics**: Track image views and interactions

## Support

If you encounter any issues:
1. Check the Cloudinary documentation
2. Review the browser console for errors
3. Verify your environment variables are correct
4. Test with a simple image upload first

Happy coding! 🚀 