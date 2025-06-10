# C-Games v4 Monorepo

A Turborepo monorepo containing HR platform and related packages for evaluating competencies through gamified scenario tests.

## Monorepo Structure

```
apps/
  ├── hr-platform/   # Main HR platform application (Vite + React)
  └── game-platform/ # Game platform application
packages/
  ├── ui-kit/        # Shared UI components
  ├── services/      # Business logic and API services
  └── types/         # Shared TypeScript type definitions
```

## Features

- User identity capture (first name + last name)
- 16-question gamified scenario test
- Interactive bubble chart visualization of competency scores
- CV analysis and AI-powered recommendations
- Responsive design with dark sci-fi UI theme
- Session-based storage with CV integration
- AI-powered conversational interface for HR professionals

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see Environment Setup below)
4. Start the development server:
   ```bash
   npm run dev:hr
   ```

## Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# OpenAI Configuration  
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Node Environment
NODE_ENV=production
```

⚠️ **IMPORTANT**: Never commit your actual API keys to the repository. The `.env` file is ignored by git for security.

## Development

- `npm run dev:hr` - Start HR platform development server
- `npm run dev:game` - Start game platform development server
- `npm run build:hr` - Build HR platform for production
- `npm run build:game` - Build game platform for production
- `npm run lint` - Run ESLint across all packages
- `npm run type-check` - Run TypeScript type checking

## Technologies Used

- **Monorepo**: Turborepo
- **Frontend**: React, TypeScript, Vite
- **UI**: Chakra UI, Custom Components
- **Charts**: Recharts
- **Routing**: React Router
- **AI**: OpenAI GPT-3.5-turbo
- **Storage**: Firebase
- **PDF Processing**: PDF.js
- **Build**: Vite, TypeScript

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment with Turborepo:

1. Connect your repository to Vercel
2. Vercel will automatically detect the Turborepo configuration
3. Set up the following environment variables in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_OPENAI_API_KEY`
   - `NODE_ENV` (set to "production")

The `vercel.json` configuration will automatically:
- Build only the HR platform using `turbo run build --filter=hr-platform`
- Output to `apps/hr-platform/dist`
- Handle routing for single-page application

## Security Notes

- Keep your API keys secure and never share them
- The `.env` file is ignored by git to prevent accidental exposure
- In production, use Vercel's environment variables feature
- For development, ensure your `.env` file is properly secured on your local machine
- OpenAI and Firebase keys should have appropriate access restrictions

## Package Dependencies

The monorepo uses shared dependencies managed by npm workspaces:
- Services package provides business logic and API integrations
- UI-kit package provides shared React components
- Types package provides shared TypeScript definitions

All packages are built automatically when deploying the HR platform.
