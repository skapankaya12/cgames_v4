# C-Games v4

A browser-based test interface for evaluating competencies through a gamified scenario test.

## Features

- User identity capture (first name + last name)
- 16-question gamified scenario test
- Interactive bubble chart visualization of competency scores
- Responsive design with dark sci-fi UI theme
- Session-based storage (no persistent data)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Main application screens
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── data/          # Test questions and scoring data
  └── App.tsx        # Main application component
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- React
- TypeScript
- Vite
- Chakra UI
- Recharts
- React Router

# Environment Setup

To run this project, you need to set up your environment variables:

1. Create a `.env` file in the project root
2. Add your OpenAI API key:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ IMPORTANT: Never commit your actual API key to the repository. The `.env` file is ignored by git for security.

## Security Notes

- Keep your API keys secure and never share them
- The `.env` file is ignored by git to prevent accidental exposure
- In production, consider using a secure secrets management service
- For development, ensure your `.env` file is properly secured on your local machine
