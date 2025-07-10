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
- Supabase account and project

### Quick Setup

1. **Clone and Install**:
   ```bash
   npm install
   # or
   bun install
   ```

2. **Environment Setup**:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Database Setup**:
   ```bash
   # Apply migrations to fix account creation issues
   supabase db reset
   ```

4. **Create Admin Account**:
   ```bash
   ./scripts/create-admin.sh admin@yourdomain.com yourpassword
   ```

5. **Start Development**:
   ```bash
   npm run dev
   ```

Visit [http://localhost:8080](http://localhost:8080) in your browser.

### Troubleshooting Account Creation

If you're having issues creating accounts, see the [Setup Guide](SETUP_GUIDE.md) for detailed troubleshooting steps.

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

## Typography

The application uses a carefully selected typography system for optimal readability and visual appeal:

- **Inter** (Sans-serif): Primary font for body text and general content
- **Orbitron** (Display): Used for headings and display text with a futuristic appearance
- **JetBrains Mono** (Monospace): Perfect for code blocks and technical content

### Font Classes

- `font-sans`: Inter font family
- `font-display`: Orbitron font family  
- `font-mono`: JetBrains Mono font family

## License

## acid-25

> Capturing moments, creating memories, and sharing stories through the lens. Join the theyaz.io community today!

## [2024-06] Schema Improvements

- Removed redundant `profile_id` from `photos` table (use `user_id` for joins to `profiles`)
- Added `updated_at` field and update trigger to `messages` table
- Ensured all relevant foreign keys use `ON DELETE CASCADE` for data integrity
- Verified/added trigger to keep `photos.likes_count` in sync with `likes` table

---

## Running with Docker

You can run the full theyaz.io stack locally using Docker Compose. This setup includes the main application (React/Vite/Supabase client) and a PostgreSQL database for Supabase.

### Requirements

- Docker and Docker Compose installed
- No other services running on ports 5173 (dev) or 5432 (Postgres)

### Project-specific Details

- **Node.js version:** 22.13.1 (as specified in the Dockerfile)
- **Database:** PostgreSQL (via official `postgres:latest` image)
- **App runs as non-root user in production**
- **Static files served with `serve` in production**

### Environment Variables

For local development, you may need to provide Supabase credentials. Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can also uncomment and set these in the `docker-compose.yml` under the `environment` section for the `typescript-app` service.

### Build and Run

To start the application and database in development mode:

```bash
docker compose up --build
```

- The React/Vite app will be available at [http://localhost:5173](http://localhost:5173)
- The PostgreSQL database will be available at `localhost:5432` (default user/password: `postgres`)

#### Ports

- **typescript-app:**
  - `5173` (Vite dev server, mapped to host)
  - `8080` (production preview, see Dockerfile; not mapped by default)
- **supabase-db:**
  - `5432` (PostgreSQL)

#### Persistent Data

- PostgreSQL data is stored in a Docker volume: `supabase-db-data`

#### Customization

- To run the app in production mode, adjust the `docker-compose.yml` to use the `prod` target and map port `8080`.
- For additional configuration, see the `DOCKER_TESTING.md` file.

---
