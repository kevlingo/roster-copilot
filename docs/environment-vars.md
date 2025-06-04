## Environment Variables Documentation

This document outlines key environment variables used in the Roster Copilot Proof-of-Concept. These variables are typically stored in an untracked `.env.local` file for local development and as secure environment variables in the deployment environment (e.g., Netlify).

### Key Environment Variables

*   **`GEMINI_API_KEY`**
    *   **Purpose:** API Key for authenticating with the Google Gemini AI Service.
    *   **Usage:** Accessed by the backend "AI Copilot Service" to make calls to the Gemini API.
    *   **Security Note:** This is a sensitive secret and must not be committed to version control. Store securely in `.env.local` and as an environment variable in the deployment platform.

*   **`RESEND_API_KEY`**
    *   **Purpose:** API Key for authenticating with the Resend email service.
    *   **Usage:** Accessed by the backend "Notification Service" to send transactional emails (e.g., email verification, password reset).
    *   **Security Note:** This is a sensitive secret and must not be committed to version control. Store securely in `.env.local` and as an environment variable in the deployment platform.

### Local Development Setup

For local development, create a `.env.local` file in the root of the `roster-copilot/` project directory with the following structure:

```
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=your_resend_api_key_here
```

**Important:** Ensure `.env.local` is listed in your `.gitignore` file to prevent accidental commits of sensitive credentials.