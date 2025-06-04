import {
  findUserByUsername,
  findUserByEmail,
  createUserProfile,
  createEmailVerificationToken,
  findVerificationToken,
  updateUserEmailVerificationStatus,
  markTokenAsUsed,
} from './user.dal';
import { UserProfile, EmailVerificationToken_PoC } from '@/lib/models/user.models';

// Declare mock functions with 'let'
let mockDbGet: jest.Mock;
let mockDbRun: jest.Mock;
let mockDbAll: jest.Mock;
let mockInitializeDatabase: jest.Mock;

// Mock the db module and assign mocks in beforeAll
// The arrow functions ensure that the mocks are called with the correct 'this' context and arguments
// when the DAL functions (e.g., findUserByUsername) invoke the mocked db functions.
jest.mock('./db', () => ({
  get: (...args: any[]) => mockDbGet(...args),
  run: (...args: any[]) => mockDbRun(...args),
  all: (...args: any[]) => mockDbAll(...args),
  initializeDatabase: (...args: any[]) => mockInitializeDatabase(...args),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('User DAL', () => {
  beforeAll(() => {
    // Initialize mocks here
    mockDbGet = jest.fn();
    mockDbRun = jest.fn();
    mockDbAll = jest.fn(); 
    mockInitializeDatabase = jest.fn().mockResolvedValue(undefined);
  });

  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    mockDbGet.mockClear();
    mockDbRun.mockClear();
    mockDbAll.mockClear();
    mockInitializeDatabase.mockClear();
  });

  describe('findUserByUsername', () => {
    it('should call mockDbGet with correct SQL and params', async () => {
      const username = 'testuser';
      await findUserByUsername(username);
      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM UserProfiles WHERE username = ?',
        [username],
      );
    });

    it('should return user profile if found', async () => {
      const mockUser: UserProfile = { userId: '1', username: 'testuser', email: 'test@test.com', passwordHash: 'hash', emailVerified: false, selectedArchetype: null, createdAt: '', updatedAt: '' };
      mockDbGet.mockResolvedValue(mockUser);
      const user = await findUserByUsername('testuser');
      expect(user).toEqual(mockUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should call mockDbGet with correct SQL and params', async () => {
      const email = 'test@example.com';
      await findUserByEmail(email);
      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM UserProfiles WHERE email = ?',
        [email],
      );
    });
  });

  describe('createUserProfile', () => {
    it('should call mockDbRun with correct SQL and params and return new user', async () => {
      const userData = { username: 'newuser', email: 'new@example.com', passwordHash: 'newhash' };
      const OriginalDate = global.Date; // Store original Date
      const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
      mockDbRun.mockResolvedValue({ lastID: 1, changes: 1 });
      
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as any);

      const newUser = await createUserProfile(userData);

      expect(mockDbRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO UserProfiles'),
        ['mock-uuid-1234', userData.username, userData.email, userData.passwordHash, 0, null, expectedDate, expectedDate],
      );
      expect(newUser).toEqual(expect.objectContaining({
        userId: 'mock-uuid-1234',
        ...userData,
        emailVerified: false,
        selectedArchetype: null,
        createdAt: expectedDate,
        updatedAt: expectedDate,
      }));
      spy.mockRestore();
    });
  });

  describe('createEmailVerificationToken', () => {
    it('should call mockDbRun with correct SQL and params', async () => {
      const tokenData = { userId: '1', token: 'token123', email: 'test@example.com', expiresAt: new Date().toISOString() };
      const OriginalDate = global.Date; // Store original Date
      const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as any);
      
      await createEmailVerificationToken(tokenData);
      expect(mockDbRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO EmailVerificationTokens_PoC'),
        [tokenData.token, tokenData.userId, tokenData.email, tokenData.expiresAt, expectedDate],
      );
      spy.mockRestore();
    });
  });

  describe('findVerificationToken', () => {
    it('should call mockDbGet and correctly parse boolean for "used"', async () => {
        const token = 'validtoken';
        const mockDbToken = { token, userId: '1', email: 'test@example.com', expiresAt: 'date', used: 0 };
        mockDbGet.mockResolvedValue(mockDbToken);
  
        const foundToken = await findVerificationToken(token);
        expect(mockDbGet).toHaveBeenCalledWith('SELECT * FROM EmailVerificationTokens_PoC WHERE token = ?', [token]);
        expect(foundToken).toEqual({ ...mockDbToken, used: false });

        const mockDbTokenUsed = { ...mockDbToken, used: 1 };
        mockDbGet.mockResolvedValue(mockDbTokenUsed);
        const foundTokenUsed = await findVerificationToken(token);
        expect(foundTokenUsed).toEqual({ ...mockDbTokenUsed, used: true });
      });
  });

  describe('updateUserEmailVerificationStatus', () => {
    it('should call mockDbRun with correct SQL and params for true', async () => {
      const userId = '1';
      const OriginalDate = global.Date; // Store original Date
      const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as any);

      await updateUserEmailVerificationStatus(userId, true);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE UserProfiles SET emailVerified = ?, updatedAt = ? WHERE userId = ?',
        [1, expectedDate, userId],
      );
      spy.mockRestore();
    });
    it('should call mockDbRun with correct SQL and params for false', async () => {
        const userId = '1';
        const OriginalDate = global.Date; // Store original Date
        const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
        const mockDateInstance = new OriginalDate(expectedDate);
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as any);
  
        await updateUserEmailVerificationStatus(userId, false);
        expect(mockDbRun).toHaveBeenCalledWith(
          'UPDATE UserProfiles SET emailVerified = ?, updatedAt = ? WHERE userId = ?',
          [0, expectedDate, userId],
        );
        spy.mockRestore();
      });
  });

  describe('markTokenAsUsed', () => {
    it('should call mockDbRun with correct SQL and params', async () => {
      const token = 'token123';
      await markTokenAsUsed(token);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE EmailVerificationTokens_PoC SET used = 1 WHERE token = ?',
        [token],
      );
    });
  });
});