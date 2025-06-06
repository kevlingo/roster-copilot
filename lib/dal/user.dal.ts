import { UserProfile, EmailVerificationToken_PoC, ResetToken_PoC } from '@/lib/models/user.models';
import { get, run } from './db'; // Removed 'all' as it's unused
import { v4 as uuidv4 } from 'uuid'; // For generating userId

/**
 * Finds a user by their username.
 * @param username The username to search for.
 * @returns A promise that resolves with the UserProfile or undefined if not found.
 */
export async function findUserByUsername(username: string): Promise<UserProfile | undefined> {
  const sql = 'SELECT * FROM UserProfiles WHERE username = ?';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await get<any>(sql, [username]);
  if (user) {
    return { ...user, emailVerified: Boolean(user.emailVerified) };
  }
  return undefined;
}

/**
 * Finds a user by their email address.
 * @param email The email address to search for.
 * @returns A promise that resolves with the UserProfile or undefined if not found.
 */
export async function findUserByEmail(email: string): Promise<UserProfile | undefined> {
  const sql = 'SELECT * FROM UserProfiles WHERE email = ?';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await get<any>(sql, [email]);
  if (user) {
    return { ...user, emailVerified: Boolean(user.emailVerified) };
  }
  return undefined;
}

/**
 * Creates a new user profile in the database.
 * @param userData Object containing username, email, and passwordHash.
 * @returns A promise that resolves with the newly created UserProfile.
 */
export async function createUserProfile(userData: {
  username: string;
  email: string;
  passwordHash: string;
}): Promise<UserProfile> {
  const userId = uuidv4();
  const now = new Date().toISOString();
  const newUser: UserProfile = {
    userId,
    username: userData.username,
    email: userData.email,
    passwordHash: userData.passwordHash,
    emailVerified: false,
    selectedArchetype: null,
    // onboardingAnswers, riskToleranceNumeric, aiInteractionStyle, favoriteNFLTeam, teamsToAvoidPlayersFrom, learnedObservations can be undefined or null initially
    createdAt: now,
    updatedAt: now,
  };

  const sql = `
    INSERT INTO UserProfiles (
      userId, username, email, passwordHash, emailVerified,
      selectedArchetype, createdAt, updatedAt
      /* -- Add other fields here if they have non-null defaults or are provided -- */
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  // Note: onboardingAnswers, riskToleranceNumeric etc. are omitted from INSERT as they can be null/undefined
  // and the table schema should allow NULLs for them or have defaults.
  // For JSON fields like onboardingAnswers, ensure they are stringified if not NULL.
  await run(sql, [
    newUser.userId,
    newUser.username,
    newUser.email,
    newUser.passwordHash,
    newUser.emailVerified ? 1 : 0, // SQLite stores booleans as 0 or 1
    newUser.selectedArchetype,
    newUser.createdAt,
    newUser.updatedAt,
  ]);
  return newUser; // The newUser object already has all necessary fields populated.
}

/**
 * Creates an email verification token in the database.
 * @param tokenData Object containing userId, token, email, and expiresAt.
 * @returns A promise that resolves when the token is created.
 */
export async function createEmailVerificationToken(tokenData: {
  userId: string;
  token: string;
  email: string;
  expiresAt: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO EmailVerificationTokens_PoC (token, userId, email, expiresAt, createdAt, used)
    VALUES (?, ?, ?, ?, ?, 0)
  `; // used defaults to 0 (false)
  await run(sql, [tokenData.token, tokenData.userId, tokenData.email, tokenData.expiresAt, now]);
}

/**
 * Finds an email verification token by the token string.
 * @param token The token string to search for.
 * @returns A promise that resolves with the EmailVerificationToken_PoC or undefined.
 */
export async function findVerificationToken(
  token: string,
): Promise<EmailVerificationToken_PoC | undefined> {
  const sql = 'SELECT * FROM EmailVerificationTokens_PoC WHERE token = ?';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await get<any>(sql, [token]);
  if (result) {
    return { ...result, used: Boolean(result.used) }; // Ensure 'used' is boolean
  }
  return undefined;
}

/**
 * Updates a user's emailVerified status.
 * @param userId The ID of the user to update.
 * @param emailVerified The new verification status.
 * @returns A promise that resolves when the user is updated.
 */
export async function updateUserEmailVerificationStatus(
  userId: string,
  emailVerified: boolean,
): Promise<void> {
  const sql = 'UPDATE UserProfiles SET emailVerified = ?, updatedAt = ? WHERE userId = ?';
  await run(sql, [emailVerified ? 1 : 0, new Date().toISOString(), userId]);
}

/**
 * Marks an email verification token as used.
 * @param token The token string to update.
 * @returns A promise that resolves when the token is updated.
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const sql = 'UPDATE EmailVerificationTokens_PoC SET used = 1 WHERE token = ?';
  await run(sql, [token]);
}

/**
 * Finds a user by their userId.
 * @param userId The userId to search for.
 * @returns A promise that resolves with the UserProfile or undefined if not found.
 */
export async function findUserById(userId: string): Promise<UserProfile | undefined> {
  const sql = 'SELECT * FROM UserProfiles WHERE userId = ?';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await get<any>(sql, [userId]);
  if (user) {
    return { ...user, emailVerified: Boolean(user.emailVerified) };
  }
  return undefined;
}

/**
 * Updates a user's username.
 * @param userId The ID of the user to update.
 * @param username The new username.
 * @returns A promise that resolves when the user is updated.
 */
export async function updateUserUsername(userId: string, username: string): Promise<void> {
  const sql = 'UPDATE UserProfiles SET username = ?, updatedAt = ? WHERE userId = ?';
  await run(sql, [username, new Date().toISOString(), userId]);
}

/**
 * Updates a user's email address and sets emailVerified to false.
 * @param userId The ID of the user to update.
 * @param email The new email address.
 * @returns A promise that resolves when the user is updated.
 */
export async function updateUserEmail(userId: string, email: string): Promise<void> {
  const sql = 'UPDATE UserProfiles SET email = ?, emailVerified = 0, updatedAt = ? WHERE userId = ?';
  await run(sql, [email, new Date().toISOString(), userId]);
}

/**
 * Updates a user's password hash.
 * @param userId The ID of the user to update.
 * @param passwordHash The new password hash.
 * @returns A promise that resolves when the user is updated.
 */
export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const sql = 'UPDATE UserProfiles SET passwordHash = ?, updatedAt = ? WHERE userId = ?';
  await run(sql, [passwordHash, new Date().toISOString(), userId]);
}

/**
 * Updates a user's selected archetype.
 * @param userId The ID of the user to update.
 * @param selectedArchetype The new selected archetype.
 * @returns A promise that resolves when the user is updated.
 */
export async function updateUserArchetype(userId: string, selectedArchetype: string): Promise<void> {
  const sql = 'UPDATE UserProfiles SET selectedArchetype = ?, updatedAt = ? WHERE userId = ?';
  await run(sql, [selectedArchetype, new Date().toISOString(), userId]);
}

/**
 * Creates a password reset token in the database.
 * @param tokenData Object containing userId, token, and expiresAt.
 * @returns A promise that resolves when the token is created.
 */
export async function createResetToken(tokenData: {
  userId: string;
  token: string;
  expiresAt: string;
}): Promise<void> {
  const sql = `
    INSERT INTO ResetTokens_PoC (token, userId, expiresAt, used)
    VALUES (?, ?, ?, 0)
  `; // used defaults to 0 (false)
  await run(sql, [tokenData.token, tokenData.userId, tokenData.expiresAt]);
}

/**
 * Finds a password reset token by the token string.
 * @param token The token string to search for.
 * @returns A promise that resolves with the ResetToken_PoC or undefined.
 */
export async function findResetToken(token: string): Promise<ResetToken_PoC | undefined> {
  const sql = 'SELECT * FROM ResetTokens_PoC WHERE token = ?';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await get<any>(sql, [token]);
  if (result) {
    return { ...result, used: Boolean(result.used) }; // Ensure 'used' is boolean
  }
  return undefined;
}

/**
 * Marks a password reset token as used.
 * @param token The token string to update.
 * @returns A promise that resolves when the token is updated.
 */
export async function markResetTokenAsUsed(token: string): Promise<void> {
  const sql = 'UPDATE ResetTokens_PoC SET used = 1 WHERE token = ?';
  await run(sql, [token]);
}