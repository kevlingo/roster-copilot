# Authentication System

This document describes the complete authentication system implemented in Roster Copilot.

## Overview

The authentication system provides secure user registration, login, logout, password reset, and email verification functionality. It uses JWT tokens for session management and bcrypt for password hashing.

## Features Implemented

### ✅ User Registration (Story 1.1)
- **Endpoint**: `POST /api/auth/signup`
- **Features**:
  - Username and email uniqueness validation
  - Password complexity requirements (min 8 chars, uppercase, lowercase, number, special char)
  - Secure password hashing with bcrypt
  - Email verification token generation
  - Automated verification email via Resend service
  - Account remains unverified until email confirmation

### ✅ Email Verification (Story 1.1)
- **Endpoint**: `GET /api/auth/verify-email/[token]`
- **Features**:
  - Secure, time-limited verification tokens
  - Token validation and expiry checking
  - Account activation upon successful verification
  - Automatic login after verification

### ✅ User Login (Story 1.2)
- **Endpoint**: `POST /api/auth/login`
- **Features**:
  - Email/password authentication
  - Email verification status checking
  - JWT token generation with user claims
  - Rate limiting for brute-force protection
  - Secure session management via Zustand store

### ✅ User Logout (Story 1.4)
- **Endpoint**: `POST /api/auth/logout`
- **Features**:
  - Client-side token clearing
  - Session state cleanup
  - Redirect to login page

### ✅ Password Reset (Story 1.5)
- **Endpoint**: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- **Features**:
  - Secure password reset token generation
  - Email delivery of reset instructions
  - Token validation and expiry
  - New password setting with validation

## Security Features

### Password Security
- **Hashing**: bcrypt with automatic salt generation
- **Complexity**: Enforced password requirements
- **Reset**: Secure token-based password reset flow

### Token Security
- **JWT**: Stateless authentication tokens
- **Expiry**: Configurable token expiration
- **Claims**: User ID and role information
- **Storage**: In-memory storage via Zustand (not localStorage)

### API Security
- **Rate Limiting**: Prevents brute-force attacks on login
- **Input Validation**: class-validator for all inputs
- **Error Handling**: Generic error messages to prevent information disclosure
- **HTTPS**: Required for production deployment

## Frontend Integration

### State Management
- **Zustand Store**: Manages authentication state
- **Token Storage**: In-memory only for security
- **Auto-logout**: On token expiry or invalid tokens

### Form Handling
- **react-hook-form**: Performant form validation
- **Client-side Validation**: Immediate feedback
- **Server-side Validation**: Final security layer

### UI Components
- **Login Page**: `/login` - Email/password form
- **Signup Page**: `/signup` - Registration form with confirmation
- **Profile Page**: `/profile` - User profile management
- **Password Reset**: Forgot password flow

## Database Schema

### UserProfile Table
```sql
CREATE TABLE UserProfile (
  userId TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### EmailVerificationTokens_PoC Table
```sql
CREATE TABLE EmailVerificationTokens_PoC (
  tokenId TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES UserProfile(userId)
);
```

## Environment Variables

Required environment variables for authentication:

```bash
# JWT secret for token signing
JWT_SECRET=your_secure_jwt_secret_here

# Resend API key for email delivery
RESEND_API_KEY=your_resend_api_key_here

# Application URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Middleware

All authentication endpoints use standardized middleware:
- **Error Handling**: Catches and logs errors, returns generic responses
- **Request Logging**: Logs all requests and responses
- **Input Validation**: Validates all inputs using class-validator

## Testing

Comprehensive test coverage includes:
- **Unit Tests**: Password hashing, token generation, validation logic
- **Integration Tests**: API endpoint testing with database
- **E2E Tests**: Complete user flows with Playwright
- **Security Tests**: Rate limiting, input validation, error handling

## Usage Examples

### Frontend Authentication Hook
```typescript
import { useAuthStore } from '@/lib/stores/auth-store';

const { user, login, logout, isAuthenticated } = useAuthStore();

// Login
await login(email, password);

// Logout
logout();

// Check authentication
if (isAuthenticated) {
  // User is logged in
}
```

### Protected API Route
```typescript
import { composeWrappers, withAuth, withErrorHandling, withRequestLogging } from '@/lib/api/middleware/route-handlers';

const handler = composeWrappers(
  withErrorHandling,
  withRequestLogging,
  withAuth
)(async (req) => {
  // Protected route logic
  return NextResponse.json({ data: 'protected' });
});

export { handler as GET };
```

## Future Enhancements

- **Multi-factor Authentication**: SMS or app-based 2FA
- **Social Login**: OAuth integration with Google, Facebook, etc.
- **Session Management**: Server-side session storage
- **Password Policies**: Configurable complexity requirements
- **Account Lockout**: Temporary lockout after failed attempts
