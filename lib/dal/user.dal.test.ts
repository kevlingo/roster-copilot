import {
  findUserByUsername,
  findUserByEmail,
  createUserProfile,
  createEmailVerificationToken,
  findVerificationToken,
  updateUserEmailVerificationStatus,
  markTokenAsUsed,
  findUserById,
  updateUserUsername,
  updateUserEmail,
  updateUserPassword,
  createResetToken,
  findResetToken,
  markResetTokenAsUsed,
} from './user.dal';
// EmailVerificationToken_PoC was unused
import { UserProfile } from '@/lib/models/user.models';

// Declare mock functions with 'let'
let mockDbGet: jest.Mock;
let mockDbRun: jest.Mock;
let mockDbAll: jest.Mock;
let mockInitializeDatabase: jest.Mock;

// Mock the db module and assign mocks in beforeAll
// The arrow functions ensure that the mocks are called with the correct 'this' context and arguments
// when the DAL functions (e.g., findUserByUsername) invoke the mocked db functions.
jest.mock('./db', () => ({
  get: (...args: unknown[]) => mockDbGet(...args),
  run: (...args: unknown[]) => mockDbRun(...args),
  all: (...args: unknown[]) => mockDbAll(...args),
  initializeDatabase: (...args: unknown[]) => mockInitializeDatabase(...args),
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
    mockInitializeDatabase = jest.fn();
  });

  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    mockDbGet.mockClear();
    mockDbRun.mockClear();
    mockDbAll.mockClear();
    mockInitializeDatabase.mockClear();
  });

  describe('findUserByUsername', () => {
    it('should call mockDbGet with correct SQL and params', () => {
      const username = 'testuser';
      findUserByUsername(username);
      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM UserProfiles WHERE username = ?',
        [username],
      );
    });

    it('should return user profile if found', () => {
      const mockUser: UserProfile = { userId: '1', username: 'testuser', email: 'test@test.com', passwordHash: 'hash', emailVerified: false, selectedArchetype: null, createdAt: '', updatedAt: '' };
      mockDbGet.mockReturnValue(mockUser);
      const user = findUserByUsername('testuser');
      expect(user).toEqual(mockUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should call mockDbGet with correct SQL and params', () => {
      const email = 'test@example.com';
      findUserByEmail(email);
      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM UserProfiles WHERE email = ?',
        [email],
      );
    });
  });

  describe('createUserProfile', () => {
    it('should call mockDbRun with correct SQL and params and return new user', () => {
      const userData = { username: 'newuser', email: 'new@example.com', passwordHash: 'newhash' };
      const OriginalDate = global.Date; // Store original Date
      const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
      mockDbRun.mockReturnValue({ lastID: 1, changes: 1 });

      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

      const newUser = createUserProfile(userData);

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
    it('should call mockDbRun with correct SQL and params', () => {
      const tokenData = { userId: '1', token: 'token123', email: 'test@example.com', expiresAt: new Date().toISOString() };
      const OriginalDate = global.Date; // Store original Date
      const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

      createEmailVerificationToken(tokenData);
      expect(mockDbRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO EmailVerificationTokens_PoC'),
        [tokenData.token, tokenData.userId, tokenData.email, tokenData.expiresAt, expectedDate],
      );
      spy.mockRestore();
    });
  });

  describe('findVerificationToken', () => {
    it('should call mockDbGet and correctly parse boolean for "used"', () => {
        const token = 'validtoken';
        const mockDbToken = { token, userId: '1', email: 'test@example.com', expiresAt: 'date', used: 0 };
        mockDbGet.mockReturnValue(mockDbToken);

        const foundToken = findVerificationToken(token);
        expect(mockDbGet).toHaveBeenCalledWith('SELECT * FROM EmailVerificationTokens_PoC WHERE token = ?', [token]);
        expect(foundToken).toEqual({ ...mockDbToken, used: false });

        const mockDbTokenUsed = { ...mockDbToken, used: 1 };
        mockDbGet.mockReturnValue(mockDbTokenUsed);
        const foundTokenUsed = findVerificationToken(token);
        expect(foundTokenUsed).toEqual({ ...mockDbTokenUsed, used: true });
      });
  });

  describe('updateUserEmailVerificationStatus', () => {
    it('should call mockDbRun with correct SQL and params for true', () => {
      const userId = '1';
      const OriginalDate = global.Date; // Store original Date
      const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

      updateUserEmailVerificationStatus(userId, true);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE UserProfiles SET emailVerified = ?, updatedAt = ? WHERE userId = ?',
        [1, expectedDate, userId],
      );
      spy.mockRestore();
    });
    it('should call mockDbRun with correct SQL and params for false', () => {
        const userId = '1';
        const OriginalDate = global.Date; // Store original Date
        const expectedDate = new OriginalDate().toISOString(); // Use original Date for expected value
        const mockDateInstance = new OriginalDate(expectedDate);
        const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

        updateUserEmailVerificationStatus(userId, false);
        expect(mockDbRun).toHaveBeenCalledWith(
          'UPDATE UserProfiles SET emailVerified = ?, updatedAt = ? WHERE userId = ?',
          [0, expectedDate, userId],
        );
        spy.mockRestore();
      });
  });

  describe('markTokenAsUsed', () => {
    it('should call mockDbRun with correct SQL and params', () => {
      const token = 'token123';
      markTokenAsUsed(token);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE EmailVerificationTokens_PoC SET used = 1 WHERE token = ?',
        [token],
      );
    });
  });

  describe('findUserById', () => {
    it('should call mockDbGet with correct SQL and params', () => {
      const userId = 'user-123';
      findUserById(userId);
      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM UserProfiles WHERE userId = ?',
        [userId],
      );
    });

    it('should return user profile if found and convert emailVerified to boolean', () => {
      const mockUser = { userId: '1', username: 'testuser', email: 'test@test.com', passwordHash: 'hash', emailVerified: 1, selectedArchetype: null, createdAt: '', updatedAt: '' };
      mockDbGet.mockReturnValue(mockUser);
      const user = findUserById('1');
      expect(user).toEqual({ ...mockUser, emailVerified: true });
    });
  });

  describe('updateUserUsername', () => {
    it('should call mockDbRun with correct SQL and params', () => {
      const userId = 'user-123';
      const username = 'newusername';
      const OriginalDate = global.Date;
      const expectedDate = new OriginalDate().toISOString();
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

      updateUserUsername(userId, username);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE UserProfiles SET username = ?, updatedAt = ? WHERE userId = ?',
        [username, expectedDate, userId],
      );
      spy.mockRestore();
    });
  });

  describe('updateUserEmail', () => {
    it('should call mockDbRun with correct SQL and params and set emailVerified to false', () => {
      const userId = 'user-123';
      const email = 'newemail@example.com';
      const OriginalDate = global.Date;
      const expectedDate = new OriginalDate().toISOString();
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

      updateUserEmail(userId, email);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE UserProfiles SET email = ?, emailVerified = 0, updatedAt = ? WHERE userId = ?',
        [email, expectedDate, userId],
      );
      spy.mockRestore();
    });
  });

  describe('updateUserPassword', () => {
    it('should call mockDbRun with correct SQL and params', () => {
      const userId = 'user-123';
      const passwordHash = 'newhash123';
      const OriginalDate = global.Date;
      const expectedDate = new OriginalDate().toISOString();
      const mockDateInstance = new OriginalDate(expectedDate);
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance as unknown as Date);

      updateUserPassword(userId, passwordHash);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE UserProfiles SET passwordHash = ?, updatedAt = ? WHERE userId = ?',
        [passwordHash, expectedDate, userId],
      );
      spy.mockRestore();
    });
  });

  describe('createResetToken', () => {
    it('should call mockDbRun with correct SQL and params', () => {
      const tokenData = { userId: 'user-123', token: 'reset-token-123', expiresAt: new Date().toISOString() };

      createResetToken(tokenData);
      expect(mockDbRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ResetTokens_PoC'),
        [tokenData.token, tokenData.userId, tokenData.expiresAt],
      );
    });
  });

  describe('findResetToken', () => {
    it('should call mockDbGet and correctly parse boolean for "used"', () => {
      const token = 'reset-token-123';
      const mockDbToken = { token, userId: 'user-123', expiresAt: 'date', used: 0 };
      mockDbGet.mockReturnValue(mockDbToken);

      const foundToken = findResetToken(token);
      expect(mockDbGet).toHaveBeenCalledWith('SELECT * FROM ResetTokens_PoC WHERE token = ?', [token]);
      expect(foundToken).toEqual({ ...mockDbToken, used: false });

      const mockDbTokenUsed = { ...mockDbToken, used: 1 };
      mockDbGet.mockReturnValue(mockDbTokenUsed);
      const foundTokenUsed = findResetToken(token);
      expect(foundTokenUsed).toEqual({ ...mockDbTokenUsed, used: true });
    });

    it('should return undefined if token not found', () => {
      mockDbGet.mockReturnValue(undefined);
      const foundToken = findResetToken('nonexistent-token');
      expect(foundToken).toBeUndefined();
    });
  });

  describe('markResetTokenAsUsed', () => {
    it('should call mockDbRun with correct SQL and params', () => {
      const token = 'reset-token-123';
      markResetTokenAsUsed(token);
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE ResetTokens_PoC SET used = 1 WHERE token = ?',
        [token],
      );
    });
  });
});