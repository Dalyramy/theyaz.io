# Gallery Component for theyaz.io

## Overview
A modern, minimalist photo gallery component built for theyaz.io that displays both Instagram posts and regular photos with real-time updates.

## Features

### 📸 Photo Display
- **Responsive Grid**: 1 column on mobile, 3 columns on desktop
- **Instagram Integration**: Fetches Instagram embeds using oEmbed API
- **Fallback Support**: Shows regular images if Instagram embeds fail
- **Lazy Loading**: Images load as needed for better performance

### 🎨 Berber-Inspired Design
- **Earthy Tones**: Stone colors (stone-50, stone-100, stone-800)
- **Geometric Simplicity**: Clean lines and minimal design
- **Hover Effects**: Subtle scale animations on hover
- **Modern Typography**: Clean, readable text styling

### ⚡ Real-Time Features
- **Live Updates**: Real-time likes_count updates via Supabase subscriptions
- **Error Handling**: Graceful fallbacks for failed API calls
- **Loading States**: Skeleton loading animations

### 🔧 Technical Features
- **TypeScript**: Fully typed with proper interfaces
- **Supabase Integration**: Direct database queries and real-time subscriptions
- **Instagram oEmbed**: Fetches Instagram post embeds
- **Error Boundaries**: Handles network and API errors gracefully

## Usage

### Route
The gallery is available at `/gallery` in the application.

### Component Structure
```tsx
import Gallery from './components/Gallery';

// Use in your app
<Gallery />
```

## Database Schema
The component expects a `photos` table with these columns:
- `id` (uuid): Primary key
- `title` (text): Photo title
- `image_url` (text): Image URL
- `instagram_post_id` (text, nullable): Instagram post ID
- `likes_count` (integer): Number of likes

## Instagram Integration
- Uses Instagram's oEmbed API: `https://api.instagram.com/oembed/`
- Post ID format: `^[A-Za-z0-9_-]+$`
- Fallback to regular image if embed fails

## Styling
- **Background**: `bg-stone-50` (light stone)
- **Cards**: `bg-white` with shadow and hover effects
- **Text**: `text-stone-800` for headings, `text-stone-600` for body
- **Buttons**: `bg-stone-700` with hover states

## Dependencies
- `axios`: For Instagram oEmbed API calls
- `@supabase/supabase-js`: Database client
- `react`: Core React library

## Installation
```bash
npm install axios
```

## Development
```bash
npm run dev
# Visit http://localhost:8081/gallery
```

## Production Deployment
1. Build the project: `npm run build`
2. Deploy to Hostinger via GitHub integration
3. Test Instagram embeds and real-time updates

## Notes
- Instagram oEmbed API may have CORS restrictions in production
- Consider using a backend proxy for Instagram API calls
- Real-time subscriptions require proper Supabase configuration 