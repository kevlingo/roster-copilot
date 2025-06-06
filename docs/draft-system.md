# Live Draft System

This document describes the complete live online snake draft room interface implemented in Roster Copilot.

## Overview

The draft system provides a real-time, interactive draft room where league participants can conduct snake-style fantasy football drafts with live updates, player filtering, and comprehensive draft management.

## Features Implemented

### ✅ Live Draft Room (Story 1.8)
- **Endpoints**: `GET/POST /api/leagues/[leagueId]/draft`, `POST /api/leagues/[leagueId]/draft/pick`
- **Page**: `/draft/[leagueId]`
- **Features**:
  - Real-time snake draft interface with automatic updates
  - Live draft board showing all picks and current state
  - Available players list with position filtering and search
  - Turn-based UI with clear indicators and controls
  - AI Copilot suggestions integration area
  - Commissioner controls for starting drafts
  - Comprehensive validation and error handling

## Data Models

### DraftState
Draft state management:
- `draftId`: Unique draft identifier
- `leagueId`: Associated league
- `currentRound`: Current draft round (1-based)
- `currentPick`: Current pick number within round (1-based)
- `currentTeamId`: Team currently on the clock
- `draftOrder`: Array of team IDs in draft order
- `status`: "NotStarted", "InProgress", or "Completed"
- `startedAt`: Draft start timestamp
- `completedAt`: Draft completion timestamp

### DraftPick
Individual draft picks:
- `pickId`: Unique pick identifier
- `draftId`: Associated draft
- `teamId`: Team making the pick
- `playerId`: Selected player
- `pickNumber`: Overall pick number (1-based)
- `round`: Round number (1-based)
- `pickInRound`: Pick number within round (1-based)
- `pickedAt`: Timestamp of pick

## API Endpoints

### Get Draft State
```
GET /api/leagues/[leagueId]/draft
```

**Authentication**: Required (JWT token)

**Response**:
```json
{
  "draftState": {
    "draftId": "draft-123",
    "leagueId": "league-456",
    "currentRound": 2,
    "currentPick": 3,
    "currentTeamId": "team-789",
    "status": "InProgress",
    "draftOrder": ["team-1", "team-2", "team-3"]
  },
  "currentPick": {
    "teamId": "team-789",
    "teamName": "Kevin's Team",
    "pickNumber": 15,
    "round": 2,
    "pickInRound": 3,
    "isUserTurn": true
  },
  "picks": [
    {
      "pickId": "pick-1",
      "teamId": "team-1",
      "playerId": "player-123",
      "playerName": "John Quarterback",
      "position": "QB",
      "pickNumber": 1,
      "round": 1,
      "pickInRound": 1
    }
  ],
  "userTeam": {
    "teamId": "team-789",
    "teamName": "Kevin's Team",
    "roster": [
      {
        "playerId": "player-456",
        "fullName": "Mike Running",
        "position": "RB",
        "nflTeamAbbreviation": "LIO"
      }
    ]
  }
}
```

### Start Draft
```
POST /api/leagues/[leagueId]/draft
```

**Authentication**: Required (Commissioner only)

**Response**:
```json
{
  "draftState": {
    "draftId": "draft-123",
    "status": "InProgress",
    "currentTeamId": "team-1",
    "draftOrder": ["team-1", "team-2", "team-3"]
  }
}
```

### Make Draft Pick
```
POST /api/leagues/[leagueId]/draft/pick
```

**Authentication**: Required (Must be user's turn)

**Request**:
```json
{
  "playerId": "player-789"
}
```

**Response**:
```json
{
  "success": true,
  "pick": {
    "pickId": "pick-15",
    "teamId": "team-789",
    "playerId": "player-789",
    "playerName": "Sarah Receiver",
    "position": "WR",
    "pickNumber": 15,
    "round": 2,
    "pickInRound": 3
  },
  "nextPick": {
    "teamId": "team-2",
    "teamName": "Next Team",
    "pickNumber": 16,
    "round": 2,
    "pickInRound": 4
  }
}
```

## Snake Draft Logic

### Draft Order Calculation
The system implements true snake draft logic:
- **Round 1**: Teams 1, 2, 3, 4, 5, 6
- **Round 2**: Teams 6, 5, 4, 3, 2, 1
- **Round 3**: Teams 1, 2, 3, 4, 5, 6
- **Round 4**: Teams 6, 5, 4, 3, 2, 1

### Pick Advancement
- Automatically advances to next pick after successful selection
- Handles round transitions and snake order reversals
- Detects draft completion when all roster spots are filled

## Frontend Implementation

### Draft Room Interface
Location: `app/(main)/draft/[leagueId]/page.tsx`

**Components**:
- **Draft Board**: Visual grid showing all picks by round and team
- **Available Players**: Filterable list of undrafted players
- **Current Roster**: User's team as it's being built
- **Turn Indicator**: Clear display of whose turn it is
- **AI Copilot Area**: Placeholder for AI suggestions

### Real-time Updates
- **Automatic Polling**: Updates every 3 seconds
- **React Hooks**: `useDraftState` for state management
- **Optimized Rendering**: Minimal re-renders for performance
- **Loading States**: Clear feedback during API calls

### Player Management
- **Position Filtering**: Filter by QB, RB, WR, TE, K, DEF
- **Search Functionality**: Search players by name
- **Player Cards**: Rich player information display
- **Availability Status**: Real-time availability updates

## Database Schema

### DraftStates Table
```sql
CREATE TABLE DraftStates (
  draftId TEXT PRIMARY KEY,
  leagueId TEXT NOT NULL,
  currentRound INTEGER NOT NULL DEFAULT 1,
  currentPick INTEGER NOT NULL DEFAULT 1,
  currentTeamId TEXT,
  draftOrder TEXT NOT NULL, -- JSON array
  status TEXT NOT NULL DEFAULT 'NotStarted',
  startedAt TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (leagueId) REFERENCES League_PoC(leagueId)
);
```

### DraftPicks Table
```sql
CREATE TABLE DraftPicks (
  pickId TEXT PRIMARY KEY,
  draftId TEXT NOT NULL,
  teamId TEXT NOT NULL,
  playerId TEXT NOT NULL,
  pickNumber INTEGER NOT NULL,
  round INTEGER NOT NULL,
  pickInRound INTEGER NOT NULL,
  pickedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (draftId) REFERENCES DraftStates(draftId),
  FOREIGN KEY (teamId) REFERENCES FantasyTeam_PoC(teamId),
  FOREIGN KEY (playerId) REFERENCES NFLPlayers(playerId)
);
```

## Service Layer

### Draft Service
Business logic for draft operations:
- **Draft Initialization**: Set up draft order and state
- **Pick Validation**: Verify user turn and player availability
- **State Management**: Update draft state after picks
- **Completion Detection**: Determine when draft is finished

### Player Service
Player data management:
- **Availability Tracking**: Track drafted vs available players
- **Filtering**: Position and search-based filtering
- **Batch Operations**: Efficient multi-player retrieval

## Security & Validation

### Turn Validation
- Verify it's the user's turn to pick
- Validate player is still available
- Ensure draft is in progress

### Commissioner Controls
- Only commissioners can start drafts
- Proper authorization checks
- Draft state validation

### Data Integrity
- Atomic pick operations
- Consistent state updates
- Error rollback mechanisms

## Testing

### Backend Testing
- Snake draft logic validation (11/11 tests passing)
- Pick validation and state updates
- Error handling and edge cases
- Database operations and transactions

### Frontend Testing
- Component rendering and interaction
- API integration and error handling
- Real-time update mechanisms
- User experience flows

## Performance Considerations

### Polling Optimization
- 3-second polling interval for real-time feel
- Efficient API responses with minimal data
- Client-side caching of static data

### Database Optimization
- Indexed queries for draft state retrieval
- Efficient pick insertion and updates
- Minimal database round trips

## Future Enhancements

### Real-time Improvements
- **WebSocket Integration**: Replace polling with real-time updates
- **Push Notifications**: Alert users when it's their turn
- **Offline Support**: Handle connection interruptions

### Draft Features
- **Auto-pick**: Automatic picks for absent users
- **Pick Timer**: Enforced time limits per pick
- **Draft Chat**: Communication during draft
- **Pick Trading**: Trade draft picks between teams

### AI Integration
- **Smart Suggestions**: AI-powered pick recommendations
- **Draft Analysis**: Real-time draft grade and analysis
- **Strategy Guidance**: Position-based drafting advice

## Usage Examples

### Starting a Draft (Commissioner)
```typescript
const startDraft = async (leagueId: string) => {
  const response = await fetch(`/api/leagues/${leagueId}/draft`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

### Making a Pick
```typescript
const makePick = async (leagueId: string, playerId: string) => {
  const response = await fetch(`/api/leagues/${leagueId}/draft/pick`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ playerId })
  });
  
  return response.json();
};
```

### Real-time State Management
```typescript
const useDraftState = (leagueId: string) => {
  const [draftState, setDraftState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraftState = async () => {
      const data = await getDraftState(leagueId);
      setDraftState(data);
      setLoading(false);
    };

    fetchDraftState();
    const interval = setInterval(fetchDraftState, 3000);
    
    return () => clearInterval(interval);
  }, [leagueId]);

  return { draftState, loading };
};
```
