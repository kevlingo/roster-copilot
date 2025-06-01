// Player Types
export interface NFLPlayer {
  playerId: string;
  fullName: string;
  position: string;
  nflTeamAbbreviation: string;
  status: 'Active' | 'Injured_Out' | 'Injured_IR' | 'Bye_Week';
  projectedPoints: number;
}

export interface RosterPlayer extends NFLPlayer {
  isStarter: boolean;
}

// League Types
export interface Team {
  teamId: string;
  name: string;
  owner: string;
}

export interface TeamStanding extends Team {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
}

export interface DraftPick {
  pickNumber: number;
  round: number;
  teamId: string;
  playerId?: string;
  playerName?: string;
  position?: string;
}

export interface LineupSlots {
  [key: string]: number;
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
  K: number;
  DST: number;
}

// User Types
export interface UserProfile {
  username: string;
  email: string;
  selectedArchetype: 'eager_learner' | 'calculated_strategist' | 'bold_playmaker' | 'busy_optimizer';
  onboardingAnswers: {
    explanationDepth?: 'basic' | 'detailed' | 'comprehensive';
    riskTolerance?: 'conservative' | 'balanced' | 'aggressive' | 'very_aggressive';
    timeCommitment?: 'minimal' | 'moderate' | 'dedicated';
  };
}

// AI Copilot Types
export type InsightCategory = 'waiver' | 'lineup' | 'trade' | 'matchup' | 'alert';

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  actionLabel?: string;
  actionPath?: string;
}