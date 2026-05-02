# HanMeet - Interactive Chinese Learning Game

HanMeet is a visually engaging, interactive single-page application designed to help users learn Chinese vocabulary through immersive scenes.

## Features

- **Interactive Scenes**: Explore environments like a Classroom and Supermarket.
- **Real-time Interaction**: Move a character around and click on objects to hear their Chinese pronunciation and see their Pinyin.
- **AI-Powered Dictionary**: Search for any English word to get its Chinese translation, powered by Gemini AI.
- **AI Proxy via Supabase Function**: Browser calls a secure backend proxy so API keys are not exposed client-side.
- **Personal Notebook**: Save new words encountered in the game or dictionary to a personal study list.
- **Auth Shell (Guest + Cloud-ready)**: Continue in local guest mode or use Supabase magic-link login.
- **Cloud Sync (Phase 6)**: In Cloud mode, profile/progress/notebook are hydrated from Supabase and synced back.
- **Visual Learning**: Uses custom-uploaded assets for a cohesive and "cure" aesthetic.

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: Google Gemini API via Supabase Edge Function proxy
- **Build Tool**: Vite

## Project Structure

- `src/App.tsx`: Main application logic and UI.
- `src/features/auth/`: Supabase auth client/service + guest/login gate.
- `supabase/schema.sql`: Bootstrap schema for `profiles`, `user_progress`, and `notebook_entries`.
- `supabase/policies.sql`: RLS policies for user-owned access.
- `public/`: Contains all image assets (items, backgrounds, character).
- `package.json`: Project dependencies and scripts.

## How to Run Locally

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure `.env`:
   - `VITE_SUPABASE_URL=...` and `VITE_SUPABASE_ANON_KEY=...` (optional for cloud login, required for default AI proxy URL)
   - `VITE_DICTIONARY_PROXY_URL=...` (optional explicit override for the AI proxy endpoint)
4. Start the development server: `npm run dev`.

## Supabase Edge Function (Dictionary Proxy)

1. Deploy function: `supabase functions deploy dictionary-proxy`
2. Set server secret in Supabase:
   - `supabase secrets set GEMINI_API_KEY=your_key_here`
3. Function path:
   - `${VITE_SUPABASE_URL}/functions/v1/dictionary-proxy`
