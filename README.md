This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Auth (Assignment 3)

The app protects the **`/protected`** route with Google sign-in via Supabase Auth.

### Flow

1. User opens `/protected` → sees gated “Sign in required” and **Sign in with Google**.
2. Clicking **Sign in with Google** → `GET /auth/login` → redirects to Google (account picker if needed), then to Supabase, then back to **`/auth/callback`** (no extra query params on this URL).
3. Callback exchanges the code for a session, sets cookies, and redirects to `/protected`.

### Env vars

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` – Supabase anon (publishable) key for Auth

Existing `SUPABASE_KEY` is still used for the images backend; Auth uses the anon key (same value is fine).

### Supabase Dashboard

1. **Auth → URL Configuration**: add your app redirect URL, e.g. `https://your-app.vercel.app/auth/callback` (and `http://localhost:3000/auth/callback` for local).
2. **Auth → Providers → Google**: enable Google, set Client ID to  
   `388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com`  
   (assignment can be done without a Client Secret).

### Google Cloud Console

- **Authorized redirect URIs**: add your Supabase Auth callback, e.g.  
  `https://qihsgnfjqmkjmoowyfbn.supabase.co/auth/v1/callback`  
- For Vercel: only `*.vercel.com/auth/callback` is whitelisted; the app redirects to exactly `/auth/callback` with no extra query parameters.
