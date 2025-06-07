# Library Migration Guide

## SQLite3 Migration (5.1.7 → 6.1.0)

### Current Implementation Analysis

The codebase currently uses callback-based SQLite3 patterns in several files:

<augment_code_snippet path="lib/dal/db.ts" mode="EXCERPT">
````typescript
export function run(sql: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
  const currentDb = ensureDbConnected();
  return new Promise((resolve, reject) => {
    currentDb.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        console.error('[SQLite DAL Error - run]', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}
````
</augment_code_snippet>

### Migration Steps

#### 1. Update Package Dependencies
```bash
npm install sqlite3@^6.1.0
npm install @types/sqlite3@^3.1.11
```

#### 2. Migrate Database Connection Pattern

**Before (Current):**
```typescript
db.serialize(() => {
  db.run(createTableSQL, (err) => {
    if (err) console.error(err);
  });
});
```

**After (Required):**
```typescript
try {
  await db.run(createTableSQL);
} catch (err) {
  console.error(err);
}
```

#### 3. Update Seeding Scripts

<augment_code_snippet path="scripts/database/seed-db.ts" mode="EXCERPT">
````typescript
db.serialize(async () => {
  db.run(createUserProfilesTableSQL, (err) => {
    if (err) {
      console.error('Error creating UserProfiles table:', err.message);
      return;
    }
    console.log('UserProfiles table created or already exists.');
  });
});
````
</augment_code_snippet>

**Migration Required:**
```typescript
// Remove db.serialize() wrapper
try {
  await db.run(createUserProfilesTableSQL);
  console.log('UserProfiles table created or already exists.');
} catch (err) {
  console.error('Error creating UserProfiles table:', err.message);
  throw err;
}
```

## Next.js Migration (14.1 → 15.2)

### Configuration Updates

#### 1. TypeScript Config Support
Create `next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Remove instrumentationHook if present
  },
  // Move existing config here
};

export default nextConfig;
```

#### 2. Error Handling Updates

**Current Pattern:**
```typescript
// In API routes
throw new Error('Something went wrong');
```

**New Pattern:**
```typescript
import { unstable_rethrow } from 'next/server';

try {
  // ... operation
} catch (error) {
  unstable_rethrow(error); // Replaces manual error propagation
  throw error;
}
```

#### 3. Server Actions Migration

If using Server Actions in Pages Router, migrate to App Router or use traditional API routes.

**Current (Pages Router with Server Actions):**
```typescript
// pages/api/action.ts - Will break in Next.js 15
export default async function handler(req, res) {
  'use server'; // This will be disabled
  // ... logic
}
```

**Migration Options:**

**Option A: Move to App Router**
```typescript
// app/api/action/route.ts
export async function POST(request: Request) {
  // ... logic
}
```

**Option B: Use Traditional API Routes**
```typescript
// pages/api/action.ts
export default async function handler(req, res) {
  // Remove 'use server' directive
  // ... logic
}
```

## React Migration (18.3 → 19.0)

### Server Components Migration

#### 1. Add Client Directives

**Current Components (Will break):**
```typescript
// components/InteractiveComponent.tsx
import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState(false);
  // ... interactive logic
}
```

**Required Migration:**
```typescript
// components/InteractiveComponent.tsx
'use client'; // Add this directive

import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState(false);
  // ... interactive logic
}
```

#### 2. Server Component Optimization

**Current Server-Side Logic:**
```typescript
// Can remain as Server Component
export default async function DataComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Optimization (No changes needed):**
```typescript
// This pattern is now stable and optimized
export default async function DataComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

#### 3. Memoization Updates

**Current Manual Memoization:**
```typescript
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

**React 19 (Automatic):**
```typescript
// React Compiler handles memoization automatically
function Component({ data }) {
  return <div>{data}</div>;
}
```

## Tailwind CSS Migration (3.4 → 4.0)

### Configuration Updates

#### 1. Update Build Configuration

**Current `tailwind.config.js`:**
```javascript
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
```

**Required `tailwind.config.js`:**
```javascript
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  compiler: 'postcss', // Required in v4
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
```

#### 2. PostCSS Configuration

**Update `postcss.config.js`:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.js'
    },
    autoprefixer: {},
  },
};
```

### DaisyUI Theme Updates

**Current Usage:**
```html
<button class="btn btn-primary">Click</button>
```

**Required Migration:**
```html
<div data-theme="corporate">
  <button class="btn btn-primary">Click</button>
</div>
```

## Jest Migration (29.7 → 30.0)

### ESM Support

#### 1. Update Package.json

**Add to `package.json`:**
```json
{
  "type": "module",
  "jest": {
    "preset": "ts-jest/presets/default-esm",
    "extensionsToTreatAsEsm": [".ts", ".tsx"]
  }
}
```

#### 2. Update Jest Configuration

**Current `jest.config.js`:**
```javascript
const nextJest = require('next/jest');
```

**Required `jest.config.js`:**
```javascript
import nextJest from 'next/jest';
```

#### 3. Update Test Files

**Current Import Pattern:**
```typescript
const { someFunction } = require('../utils');
```

**Required Import Pattern:**
```typescript
import { someFunction } from '../utils.js'; // Note .js extension
```

## TypeScript Migration (5.5 → 5.7)

### Stricter Type Enforcement

#### 1. Catch Clause Updates

**Current Pattern:**
```typescript
try {
  // ... operation
} catch (err) {
  console.error(err.message); // Will error in 5.7
}
```

**Required Pattern:**
```typescript
try {
  // ... operation
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  }
}
```

#### 2. Decorator Metadata

**Current Decorator Usage:**
```typescript
@IsEmail()
email: string;
```

**Required Updates (if using custom decorators):**
```typescript
// Add Symbol.metadata polyfill if needed
if (!Symbol.metadata) {
  (Symbol as any).metadata = Symbol('metadata');
}
```

## Migration Checklist

### Pre-Migration
- [ ] Create backup branch
- [ ] Document current test results (301 passing)
- [ ] Run security audit baseline
- [ ] Tag current stable version

### SQLite3 Migration
- [ ] Update package dependencies
- [ ] Migrate `lib/dal/db.ts` to promise-based API
- [ ] Update `scripts/database/seed-db.ts`
- [ ] Remove all `db.serialize()` calls
- [ ] Test database operations
- [ ] Run integration tests

### Next.js Migration
- [ ] Create `next.config.ts` (optional)
- [ ] Update error handling patterns
- [ ] Migrate Server Actions if needed
- [ ] Test API routes
- [ ] Verify static page generation

### React Migration
- [ ] Add `'use client'` directives to interactive components
- [ ] Test component rendering
- [ ] Verify state management
- [ ] Check for deprecated API usage

### Tailwind Migration
- [ ] Update configuration files
- [ ] Test component styling
- [ ] Verify DaisyUI theme integration
- [ ] Check responsive design

### Jest Migration
- [ ] Update configuration for ESM
- [ ] Migrate import statements
- [ ] Update test file extensions
- [ ] Run full test suite

### TypeScript Migration
- [ ] Update catch clause typing
- [ ] Fix strict type errors
- [ ] Update decorator usage if needed
- [ ] Run type checking

### Post-Migration Validation
- [ ] All tests passing
- [ ] Build successful
- [ ] E2E tests passing
- [ ] Security audit clean
- [ ] Performance benchmarks acceptable

## Rollback Plan

If migration fails:
1. Revert to tagged stable version
2. Restore package.json dependencies
3. Clear node_modules and reinstall
4. Run test suite to verify stability
5. Document issues for future migration attempts
