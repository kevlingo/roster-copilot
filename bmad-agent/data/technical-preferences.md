# Technical Preferences for Roster Copilot

## Overview

This document captures the definitive technical preferences and decisions for the Roster Copilot project. These preferences guide all AI agents in making consistent technical choices throughout development.

## Core Technology Stack

### Primary Language & Runtime
- **Language:** TypeScript 5.x
- **Runtime:** Node.js 22.x LTS
- **Framework:** Next.js 14.x (App Router)

### Frontend Technologies
- **UI Framework:** React 18.x (via Next.js)
- **Styling:** Tailwind CSS 3.4.x with DaisyUI 4.7.x
- **State Management:** React Context API (primary), Zustand (if global store needed)
- **Component Library:** DaisyUI components built on Tailwind CSS

### Backend Technologies
- **API Framework:** Next.js API Routes (serverless functions)
- **Database:** SQLite (PoC) with provider model for future migration
- **AI Service:** Google Gemini AI via @google/generative-ai SDK
- **Email Service:** Resend API via official SDK

### Development Tools
- **Package Manager:** npm (consistent across project)
- **Linting:** ESLint with eslint-config-next
- **Formatting:** Prettier (default settings)
- **Testing:** Jest + React Testing Library + Playwright (E2E)

## Architectural Patterns

### Design Patterns
- **Provider Model:** For data access abstraction (future-proofing)
- **Repository Pattern:** For database operations
- **Component-Based Architecture:** React components with clear separation
- **API-Driven AI Integration:** Centralized AI service layer

### Code Organization
- **Monorepo Structure:** Single repository for full-stack application
- **Feature-Based Organization:** Group related components and logic
- **Service Layer Pattern:** Business logic separated from API routes
- **Clear Separation of Concerns:** UI, business logic, data access

## Coding Standards

### Naming Conventions
- **Variables & Functions:** camelCase
- **Classes & Components:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** PascalCase.tsx (components), kebab-case.ts (utilities)

### TypeScript Standards
- **Strict Mode:** Enabled with all strict flags
- **Type Safety:** Avoid `any` type, use `unknown` if needed
- **Interface Definitions:** Clear interfaces for all data structures
- **Error Handling:** Proper try/catch with typed errors

### React Standards
- **Functional Components:** Prefer over class components
- **Hooks Usage:** Follow Rules of Hooks
- **State Management:** Local state first, Context for shared state
- **Component Structure:** Props interface, component, export

## Testing Preferences

### Testing Strategy
- **Unit Tests:** Jest + React Testing Library for components
- **Integration Tests:** API route testing with mocked dependencies
- **E2E Tests:** Playwright for critical user flows
- **Coverage:** Focus on business logic and critical paths

### Testing Conventions
- **File Naming:** *.test.ts or *.spec.ts
- **Location:** Co-located with source files or __tests__ directory
- **Mocking:** Jest mocks for external dependencies
- **Test Data:** Static/synthetic data for consistent testing

## Security Preferences

### Authentication & Authorization
- **Session Management:** JWT tokens in HttpOnly cookies
- **API Protection:** Middleware validation for protected routes
- **Input Validation:** DTO validation for all API inputs
- **Secret Management:** Environment variables, no hardcoded secrets

### Data Security
- **Input Sanitization:** Validate all external inputs
- **Output Encoding:** React default XSS protection
- **PII Handling:** Careful handling of user data in AI prompts
- **Dependency Security:** Regular npm audit checks

## Deployment Preferences

### Platform & Infrastructure
- **Hosting:** Netlify (PoC deployment)
- **Functions:** Netlify serverless functions for API routes
- **Database:** SQLite file-based (PoC), provider model for future
- **CDN:** Netlify CDN for static assets
- **CI/CD:** Netlify Git integration for automated deployment

### Environment Management
- **Environments:** Local development, Production (demo)
- **Configuration:** Environment variables for secrets and config
- **Deployment:** Continuous deployment from main branch
- **Rollback:** Git revert + redeploy strategy

## AI Integration Preferences

### Google Gemini AI
- **Model Selection:** Gemini Flash for speed, Gemini Pro for complex reasoning
- **Prompt Engineering:** Structured prompts with clear context
- **Response Processing:** Parse and validate AI responses
- **Error Handling:** Graceful fallbacks for AI service failures

### AI Service Architecture
- **Centralized Service:** Single AI service layer for all AI interactions
- **Prompt Management:** Reusable prompt templates and builders
- **Context Management:** User preference-driven prompt customization
- **Response Caching:** Consider caching for repeated queries (future)

## Performance Preferences

### Frontend Performance
- **Bundle Optimization:** Next.js automatic optimization
- **Image Optimization:** Next.js Image component
- **Code Splitting:** Automatic with Next.js App Router
- **Lazy Loading:** For non-critical components

### Backend Performance
- **Database Queries:** Efficient SQLite queries with indexing
- **API Response Times:** Target 3-5 seconds for AI responses
- **Caching Strategy:** Static data caching, consider AI response caching
- **Resource Management:** Efficient memory usage in serverless functions

## Development Workflow Preferences

### Version Control
- **Branching:** Feature branches with descriptive names
- **Commits:** Conventional commit messages
- **Pull Requests:** Required for main branch changes
- **Code Review:** AI-assisted development with human oversight

### Development Process
- **TDD Approach:** Pragmatic TDD for critical business logic
- **Documentation:** JSDoc for complex functions, README for setup
- **Error Handling:** Comprehensive error handling with user-friendly messages
- **Logging:** Structured logging for debugging and monitoring

## Change Log

| Change | Date | Version | Description | Author |
| ------ | ---- | ------- | ----------- | ------ |
| Initial Technical Preferences Created | 2025-06-06 | 1.0 | Created comprehensive technical preferences for Roster Copilot project based on Architecture Document and PRD requirements | BMAD PO Agent |
