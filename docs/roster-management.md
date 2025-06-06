# Roster Management System

This document describes the roster management functionality implemented in Roster Copilot.

## Overview

The roster management system allows users to view their fantasy football team rosters, including player details, position groupings, and roster composition analysis.

## Features Implemented

### ✅ Team Roster Viewing (Story 1.9)
- **Endpoint**: `GET /api/leagues/[leagueId]/my-team/roster`
- **Page**: `/league/[leagueId]/roster`
- **Features**:
  - View all players on the user's roster
  - Player details including name, position, team, status, and projected points
  - Position-based grouping (QB, RB, WR, TE, K, DEF)
  - Roster composition summary (e.g., "QB 1/1", "RB 0/2")
  - Responsive design for mobile, tablet, and desktop
  - Loading states and error handling

## Data Models

### NFLPlayer
Players are stored with the following information:
- `playerId`: Unique identifier
- `fullName`: Player's full name
- `position`: QB, RB, WR, TE, K, or DEF
- `nflTeamAbbreviation`: NFL team (e.g., "LIO", "BEA")
- `status`: Active, Injured_Out, Injured_Questionable, or Bye Week
- `projectedPoints`: Fantasy points projection
- `keyAttributes`: Consistency rating, upside potential, role
- `notes`: Additional player information

### FantasyTeam_PoC
Fantasy teams track:
- `teamId`: Unique team identifier
- `userId`: Owner's user ID
- `leagueId`: League the team belongs to
- `teamName`: User-defined team name
- `playerIds_onRoster`: Array of player IDs on the roster

### League_PoC
Leagues define roster settings:
- `rosterSettings`: Position requirements (QB: 1, RB: 2, WR: 2, etc.)
- `currentSeasonWeek`: Current week for projections

## API Endpoints

### Get Team Roster
```
GET /api/leagues/[leagueId]/my-team/roster
```

**Authentication**: Required (JWT token)

**Response**:
```json
{
  "team": {
    "teamId": "team-123",
    "teamName": "My Fantasy Team",
    "leagueId": "league-456"
  },
  "players": [
    {
      "playerId": "player-789",
      "fullName": "John Quarterback",
      "position": "QB",
      "nflTeamAbbreviation": "LIO",
      "status": "Active",
      "projectedPoints": 18.5,
      "keyAttributes": {
        "consistencyRating": "High",
        "upsidePotential": "Medium",
        "role": "Starter"
      },
      "notes": "Strong arm, good decision maker"
    }
  ],
  "rosterSettings": {
    "QB": 1,
    "RB": 2,
    "WR": 2,
    "TE": 1,
    "K": 1,
    "DEF": 1,
    "BENCH": 6
  }
}
```

## Frontend Implementation

### Roster Page Component
Location: `app/(main)/league/[leagueId]/roster/page.tsx`

**Features**:
- Fetches roster data on page load
- Groups players by position
- Displays roster composition summary
- Shows player status with color-coded badges
- Handles loading and error states
- Responsive grid layout

### UI Components
- **Player Cards**: Individual player information display
- **Position Groups**: Organized tables by position
- **Status Badges**: Color-coded player status indicators
- **Roster Summary**: Position slot counts and requirements
- **Empty State**: Helpful message when roster is empty

### Styling
- **Tailwind CSS**: Utility-first styling
- **DaisyUI**: Pre-built component library
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Consistent with application theme

## Database Integration

### Data Access Layer (DAL)
The roster system uses existing DAL functions:
- `getFantasyTeamByUserAndLeague()`: Retrieve user's team
- `getNFLPlayersByIds()`: Fetch player details
- `getLeagueById()`: Get league roster settings

### Static Data
NFL player and game data is generated via:
- `scripts/data-generation/generate-static-data.ts`
- Stored in `data/static-nfl-data/nfl-players.json`
- Seeded into SQLite database via `scripts/database/seed-db.ts`

## Security & Authorization

### Access Control
- Users can only view their own team rosters
- League membership verification required
- JWT authentication on all endpoints

### Data Validation
- League ID parameter validation
- User authentication verification
- Team ownership confirmation

## Testing

### Unit Tests
- API endpoint logic testing
- Data transformation validation
- Error handling verification

### Integration Tests
- Database query testing
- API response validation
- Authentication flow testing

### Manual Testing
- UI responsiveness across devices
- Loading state behavior
- Error condition handling

## Future Enhancements

### Planned Features (Upcoming Stories)
- **Lineup Management**: Set starting lineup vs bench players
- **Player Transactions**: Add/drop players, trades
- **Waiver Wire**: Claim available players
- **Roster Analysis**: AI-powered roster recommendations

### UI Improvements
- **Drag & Drop**: Reorder players in lineup
- **Player Comparison**: Side-by-side player stats
- **Roster Trends**: Historical performance tracking
- **Mobile Optimization**: Enhanced mobile experience

### Performance Optimizations
- **Caching**: Player data caching strategies
- **Pagination**: Large roster handling
- **Real-time Updates**: Live roster changes
- **Offline Support**: Cached roster viewing

## Usage Examples

### Accessing Team Roster
1. Navigate to `/league/[leagueId]/roster`
2. System authenticates user and verifies league membership
3. Roster data loads with player details and position groupings
4. Users can view all roster information and composition

### API Usage
```typescript
// Fetch roster data
const response = await fetch(`/api/leagues/${leagueId}/my-team/roster`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const rosterData = await response.json();
```

### Component Integration
```typescript
import { useEffect, useState } from 'react';

const RosterPage = ({ params }: { params: { leagueId: string } }) => {
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRosterData(params.leagueId);
  }, [params.leagueId]);

  // Component implementation
};
```
