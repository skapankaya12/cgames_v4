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
