# theyaz.io | Creative Gallery

Explore and share creative moments through a curated photo gallery. theyaz.io is a modern web application for photographers and enthusiasts to showcase, discover, and interact with stunning images—built with React, Vite, Supabase, and Tailwind CSS.

## Features

- 📸 Upload and share high-quality photos (JPEG, PNG, WebP, up to 10MB)
- 🏷️ Tag photos and add captions
- 🔍 Search and explore a public gallery
- ❤️ Like and comment on photos
- 🧑‍🤝‍🧑 User profiles and authentication (Email, Google, Apple, Facebook)
- 📨 Notifications and messaging
- 🖼️ Responsive, mobile-first design
- 🛡️ Secure, privacy-focused, and PWA-ready

## Demo

[theyaz.io](https://theyaz.io)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or bun

### Installation

```bash
npm install
# or
bun install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) in your browser.

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

Deployment is automated via GitHub Actions to Hostinger using SFTP/SSH. On push to `main`, the app is built and uploaded to your server's `public_html` directory.

#### Configure GitHub Secrets:

- `FTP_HOST`: Your Hostinger server IP/hostname
- `FTP_USERNAME`: Your SFTP/SSH username
- `SSH_PRIVATE_KEY`: Your private SSH key

#### Manual Upload

You can also manually upload the contents of `dist/` to your web host.

## Environment Variables

Create a `.env` file for local development:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database

- Powered by [Supabase](https://supabase.com/) (PostgreSQL)
- Tables: `photos`, `profiles`, `comments`, `likes`, `notifications`, `messages`
- See `src/integrations/supabase/types.ts` for schema

## Authentication

- Email/password sign up & login
- OAuth: Google, Apple, Facebook

## Upload Requirements

- JPEG, PNG, or WebP images
- Max file size: 10MB
- Title and caption required

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

## acid-25

> Capturing moments, creating memories, and sharing stories through the lens. Join the theyaz.io community today!

## [2024-06] Schema Improvements

- Removed redundant `profile_id` from `photos` table (use `user_id` for joins to `profiles`)
- Added `updated_at` field and update trigger to `messages` table
- Ensured all relevant foreign keys use `ON DELETE CASCADE` for data integrity
- Verified/added trigger to keep `photos.likes_count` in sync with `likes` table
