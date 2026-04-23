# HanMeet - Interactive Chinese Learning Game

HanMeet is a visually engaging, interactive single-page application designed to help users learn Chinese vocabulary through immersive scenes.

## Features

- **Interactive Scenes**: Explore environments like a Classroom and Supermarket.
- **Real-time Interaction**: Move a character around and click on objects to hear their Chinese pronunciation and see their Pinyin.
- **AI-Powered Dictionary**: Search for any English word to get its Chinese translation, powered by Gemini AI.
- **Personal Notebook**: Save new words encountered in the game or dictionary to a personal study list.
- **Visual Learning**: Uses custom-uploaded assets for a cohesive and "cure" aesthetic.

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: Google Gemini API (@google/genai)
- **Build Tool**: Vite

## Project Structure

- `src/App.tsx`: Main application logic and UI.
- `public/`: Contains all image assets (items, backgrounds, character).
- `package.json`: Project dependencies and scripts.

## How to Run Locally

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your Gemini API key in a `.env` file: `GEMINI_API_KEY=your_key_here`.
4. Start the development server: `npm run dev`.
