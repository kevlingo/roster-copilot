# Roster Copilot - Proof of Concept (PoC)

This project is a Proof-of-Concept for Roster Copilot, an AI-powered assistant for fantasy football league management.

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

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Seeding (for PoC)

To seed the SQLite database with initial NFL player and game data for the Proof-of-Concept, run the following command:

```bash
npm run db:seed
```

This script will:
- Create the database file at `data/roster_copilot_poc.db` if it doesn't exist.
- Create the necessary tables (`NFLPlayers`, `NFLGames`).
- Populate the tables from the JSON files located in `data/static-nfl-data/`.
- The script is idempotent: if run multiple times, it will clear existing data from the tables before seeding.

## Project Structure

Refer to [`docs/project-structure.md`](docs/project-structure.md) for an overview of the project layout.

## Tech Stack

Refer to [`docs/tech-stack.md`](docs/tech-stack.md) for details on the technologies used.

## Operational Guidelines

Refer to [`docs/operational-guidelines.md`](docs/operational-guidelines.md) for coding standards, testing strategy, etc.