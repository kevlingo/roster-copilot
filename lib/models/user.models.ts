export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  selectedArchetype:
    | 'Eager Learner'
    | 'Calculated Strategist'
    | 'Bold Playmaker'
    | 'Busy Optimizer'
    | null;
  onboardingAnswers?: {
    preferredExplanationDepth?: 'simple' | 'standard' | 'detailed';
    riskComfortLevel?: 'low' | 'medium' | 'high';
  };
  riskToleranceNumeric?: number;
  aiInteractionStyle?: 'concise' | 'balanced' | 'thorough';
  favoriteNFLTeam?: string;
  teamsToAvoidPlayersFrom?: string[];
  learnedObservations?: {
    draftTendencies?: string[];
    playerStyleAffinity?: string[];
  };
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface EmailVerificationToken_PoC {
  token: string; // The unique token
  userId: string; // User this token belongs to
  email: string; // Email to be verified
  expiresAt: string; // ISO timestamp for expiry
  // PoC: We might also want a 'used' flag or simply delete upon use
  used?: boolean;
}

export interface ResetToken_PoC {
  token: string; // The unique token
  userId: string; // User this token belongs to
  expiresAt: string; // ISO timestamp for expiry
  used: boolean; // Whether the token has been used
}