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
- **NEW**: Smart invite system with game selection per project
- **NEW**: Real-time status tracking and results flow
- **NEW**: Custom domain support (hub.olivinhr.com)
- **NEW**: Thank you screens and completion tracking

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- Vercel CLI (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see Environment Setup below)
4. Start the development server:
   ```bash
   npm run dev:hr    # For HR platform
   npm run dev:game  # For Game platform
   ```

## Environment Setup

### Required Environment Variables

Create environment variables in your Vercel dashboard with the following:

#### **Firebase Configuration**
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_service_account_private_key
```

#### **OpenAI Configuration**  
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

#### **SendGrid Configuration**
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### **Platform URLs**
```bash
VITE_GAME_PLATFORM_URL=https://hub.olivinhr.com
NODE_ENV=production
```

⚠️ **IMPORTANT**: Never commit your actual API keys to the repository. Set these as environment variables in your Vercel dashboard.

## Deployment

### Two-Platform Setup

This system requires two separate Vercel deployments:

#### **1. HR Platform (app.olivinhr.com)**
```bash
# Deploy with main vercel.json
vercel --prod
```

#### **2. Game Platform (hub.olivinhr.com)**
```bash
# Deploy with game-specific config
vercel --prod --config vercel-game.json
```

### Domain Configuration

1. **HR Platform**: Configure `app.olivinhr.com` to point to the main Vercel deployment
2. **Game Platform**: Configure `hub.olivinhr.com` to point to the game deployment

### Environment Variables Setup

In your Vercel dashboard, add all the environment variables listed above to **both** deployments.

## System Flow

### Complete Assessment Flow

1. **HR sends invite** → Email with hub.olivinhr.com link + token
2. **Candidate clicks link** → Game platform validates token & routes to correct game
3. **Candidate completes assessment** → Results submitted to Firebase
4. **Status updates automatically** → HR sees "Completed" status
5. **HR views results** → Detailed competency breakdown and analytics
6. **Candidate sees thank you page** → Professional completion experience

### Game Selection Per Project

- HR selects preferred games during project creation
- Each invite includes the selected game type
- Candidates are automatically routed to the correct assessment
- Future-proof for multiple game types

## Development

- `npm run dev:hr` - Start HR platform development server
- `npm run dev:game` - Start game platform development server  
- `npm run build:hr` - Build HR platform for production
- `npm run build:game` - Build game platform for production

## Testing

After deployment, test these critical paths:

1. **HR Login & Project Creation**
2. **Send Invite with Game Selection**
3. **Candidate Assessment Flow**
4. **Results Submission & Thank You**
5. **HR Results Viewing**

## Support

For deployment issues or questions, check:
- Vercel deployment logs
- Browser console for client-side errors
- API endpoint responses
- Firebase console for data flow

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
