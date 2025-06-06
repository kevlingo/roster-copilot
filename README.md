# Roster Copilot - Proof of Concept (PoC)

This project is a Proof-of-Concept for Roster Copilot, an AI-powered assistant for fantasy football league management. The application features a conversational AI Copilot powered by Google Gemini that helps users through personalized onboarding and provides intelligent fantasy football guidance.

## Features Implemented

### ✅ Core Platform Foundation
- **User Authentication System**: Complete signup, login, logout, and password reset functionality
- **Email Verification**: Secure email verification using Resend service
- **User Profile Management**: Users can view and update their profile information
- **League Management**: Join existing leagues with comprehensive validation and team creation
- **Live Draft System**: Real-time snake draft room with turn-based picking and live updates
- **Team Roster Management**: View team rosters with player details and position groupings
- **API Middleware**: Standardized error handling, request logging, and authentication middleware

### ✅ AI Copilot Foundation
- **Conversational Onboarding**: Complete archetype selection through natural chat interface
- **Fantasy Manager Archetypes**: Four personality-based user profiles (Eager Learner, Calculated Strategist, Bold Playmaker, Busy Optimizer)
- **Natural Language Processing**: Handles user responses by name, number, or description
- **User Profile Integration**: Persists archetype selections to user profiles
- **Chat Interface**: Persistent chat interface with conversation state management
- **Google Gemini AI Integration**: Backend AI service integration for intelligent conversations

### ✅ Database & Data Management
- **SQLite Database**: File-based persistence with comprehensive data models
- **Static NFL Data**: Generated fictional NFL player and game data for PoC testing
- **Database Seeding**: Automated scripts for populating test data

## Getting Started

### Prerequisites

- Node.js (version specified in `docs/tech-stack.md`, e.g., ~20.x or ~22.x LTS)
- npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd roster-copilot
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:
```bash
# Google Gemini AI service (for AI Copilot features)
GEMINI_API_KEY=your_gemini_api_key_here

# Email service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# JWT secret for authentication
JWT_SECRET=your_jwt_secret_here

# Application URL (for email verification links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
```

To start with a fresh database and seeded data:

```bash
npm run dev:seeded
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Seeding (for PoC)

To seed the SQLite database with initial NFL player and game data for the Proof-of-Concept, run the following command:

```bash
npm run db:seed
```

This script will:
- Create the database file at `data/roster_copilot_poc.db` if it doesn't exist.
- Create the necessary tables (`NFLPlayers`, `NFLGames`, `UserProfile`, etc.).
- Populate the tables from the JSON files located in `data/static-nfl-data/`.
- Create a default test user (Kevin, email: kevlingo@gmail.com, password: 7fej3w_ixVjRaKW)
- The script is idempotent: if run multiple times, it will clear existing data from the tables before seeding.

## Testing

Run the test suite:

```bash
# Unit and integration tests
npm test

# Watch mode for development
npm test:watch

# End-to-end tests
npm test:e2e
```

## Available Scripts

- `npm run dev` - Start development server (cleans database first)
- `npm run dev:seeded` - Start development server with fresh seeded database
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run db:seed` - Seed the database with test data

## Project Structure

Refer to [`docs/project-structure.md`](docs/project-structure.md) for an overview of the project layout.

## Tech Stack

Refer to [`docs/tech-stack.md`](docs/tech-stack.md) for details on the technologies used.

## Documentation

- [`docs/index.md`](docs/index.md) - Complete documentation index
- [`docs/backend-setup.md`](docs/backend-setup.md) - Backend API setup and middleware
- [`docs/operational-guidelines.md`](docs/operational-guidelines.md) - Coding standards and testing strategy

## Development Notes

- The application uses SQLite for data persistence in the PoC
- Email verification is handled through the Resend service
- Authentication uses JWT tokens stored in Zustand state management
- All API routes include standardized error handling and request logging
- The frontend uses Next.js App Router with Tailwind CSS and DaisyUI for styling
- AI Copilot features are powered by Google Gemini AI with conversational onboarding implemented
- Users without selected archetypes are automatically guided through the onboarding conversation flow