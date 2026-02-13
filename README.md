# CrackdTagram

A platform for exploring and sharing humorous images and captions. Sign in with Google to browse captions, like your favorites, and collect them in **My Humor**.

## What it does

- **Home** — Browse all captions for public images, sorted by like count. Use the heart to like a caption; if you’ve already liked it (from `caption_votes`), the heart shows red.
- **My Humor** — A grid of the images and captions you’ve liked. Only visible when signed in.
- **About** — Short description of the project and features.

Authentication is handled with Supabase (Google OAuth). Data lives in Supabase: `images`, `captions`, `caption_votes`, and `profiles`.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables (e.g. `.env.local`) with your Supabase project:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Sign in with Google to use the app.

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) for auth and database
- Tailwind CSS for styling
