# League Management System

This document describes the league management functionality implemented in Roster Copilot.

## Overview

The league management system allows users to join existing fantasy football leagues with comprehensive validation and provides the foundation for league participation and team management.

## Features Implemented

### ✅ League Joining (Story 1.7)
- **Endpoint**: `POST /api/leagues/[leagueId]/join`
- **Page**: `/league/join`
- **Features**:
  - Join existing leagues by League ID
  - Comprehensive validation (league exists, capacity, draft status)
  - Duplicate membership prevention
  - Automatic team creation with default naming
  - Route protection with authentication guards
  - Enhanced user experience with proper error handling

## Data Models

### League_PoC
Leagues are stored with the following information:
- `leagueId`: Unique league identifier
- `leagueName`: User-defined league name
- `numberOfTeams`: Maximum number of participants
- `participatingTeamIds`: Array of team IDs in the league
- `draftStatus`: "Scheduled", "InProgress", or "Completed"
- `rosterSettings`: Position requirements and roster composition
- `currentSeasonWeek`: Current week for scoring

### FantasyTeam_PoC
Fantasy teams track:
- `teamId`: Unique team identifier
- `userId`: Owner's user ID
- `leagueId`: League the team belongs to
- `teamName`: User-defined team name (defaults to "{Username}'s Team")
- `playerIds_onRoster`: Array of player IDs on the roster

## API Endpoints

### Join League
```
POST /api/leagues/[leagueId]/join
```

**Authentication**: Required (JWT token)

**Validation**:
- League exists and is accessible
- User is not already in the league
- League has available capacity
- Draft status is "Scheduled" (not in progress or completed)

**Response**:
```json
{
  "league": {
    "leagueId": "league-123",
    "leagueName": "My Fantasy League",
    "numberOfTeams": 10,
    "participatingTeamIds": ["team-1", "team-2", "team-3"],
    "draftStatus": "Scheduled"
  },
  "team": {
    "teamId": "team-456",
    "teamName": "Kevin's Team",
    "leagueId": "league-123",
    "userId": "user-789"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: League does not exist
- `403 Forbidden`: League is full or draft has started/completed
- `409 Conflict`: User already has a team in this league

## Frontend Implementation

### Join League Page
Location: `app/(main)/league/join/page.tsx`

**Features**:
- Clean, responsive form with League ID input
- Client-side validation for empty League ID
- Integration with backend API endpoint
- Comprehensive error handling for all API scenarios
- Success message and automatic redirect to league roster
- Loading states and form disabling during submission
- Navigation links to create league and dashboard

### Dashboard Integration
Location: `app/(main)/dashboard/page.tsx`

**Features**:
- "Join League" button next to "Create League" button
- Proper navigation to join league page
- Consistent UI design with existing dashboard elements

### Route Protection
**AuthGuard Component**:
- Automatically redirects unauthenticated users to login
- Enhanced auth store with sessionStorage persistence
- All protected routes under `app/(main)/` properly secured
- Authentication state persists across page refreshes

## Database Integration

### Data Access Layer (DAL)
The league joining system uses comprehensive DAL functions:
- `createFantasyTeam()`: Creates new fantasy team records
- `getFantasyTeamById()`: Retrieves fantasy team by ID
- `getFantasyTeamsByUserId()`: Gets all teams for a user
- `getFantasyTeamsByLeagueId()`: Gets all teams in a league
- `userHasTeamInLeague()`: Checks if user already has team in league
- `updateLeagueParticipatingTeams()`: Updates league's participating team IDs

### Database Operations
- **Atomic Operations**: Team creation and league updates are atomic
- **Validation**: Comprehensive validation at database level
- **Error Handling**: Proper error responses for all failure scenarios

## Security & Authorization

### Access Control
- JWT authentication required for all league operations
- League membership validation for protected operations
- User ownership verification for team operations

### Data Validation
- League ID parameter validation
- User authentication verification
- League capacity and status checking
- Duplicate membership prevention

## Enhanced Development Experience

### Database Seeding
- **Default Test User**: Kevin (kevlingo@gmail.com, password: 7fej3w_ixVjRaKW)
- **Enhanced Seeding Script**: Includes UserProfiles table
- **Combined Script**: `npm run dev:seeded` for seamless development
- **Proper Async Handling**: Improved seeding process reliability

### Authentication Improvements
- **Missing Authorization Headers**: Fixed JWT token transmission
- **Database Initialization**: Resolved API route database issues
- **Session Persistence**: Enhanced auth store with sessionStorage
- **Route Protection**: Comprehensive authentication guards

## Testing

### Unit Tests
- Backend league joining logic validation
- Frontend form component testing
- Error scenario handling
- Loading state behavior

### Integration Tests
- API endpoint testing with database
- Authentication flow testing
- League validation testing

### End-to-End Tests
- Complete league joining workflow
- Error scenario testing (404, 403, 409)
- Authentication and authorization flows

## Future Enhancements

### Planned Features
- **League Creation**: Create new leagues with custom settings
- **League Management**: Commissioner controls and settings
- **League Discovery**: Browse and search available leagues
- **Invitation System**: Invite users to join leagues

### UI Improvements
- **League Browser**: Visual league discovery interface
- **League Details**: Comprehensive league information display
- **Team Management**: Enhanced team customization options
- **League Statistics**: Performance and engagement metrics

### Advanced Features
- **League Templates**: Pre-configured league types
- **Custom Scoring**: Configurable scoring systems
- **League Chat**: Communication between league members
- **League History**: Historical data and statistics

## Usage Examples

### Joining a League
1. Navigate to `/league/join`
2. Enter League ID in the form
3. Click "Join League" button
4. System validates league and user eligibility
5. On success, user is redirected to league roster page
6. On error, appropriate error message is displayed

### API Usage
```typescript
// Join a league
const response = await fetch(`/api/leagues/${leagueId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
```

### Component Integration
```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const JoinLeaguePage = () => {
  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await joinLeague(leagueId);
      router.push(`/league/${leagueId}/roster`);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Component implementation
};
```
