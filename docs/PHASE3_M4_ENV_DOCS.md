# Phase 3 M4 — Next.js Environment Variables Documentation

**Date**: 2025-11-11T20:19:26.231Z  
**Phase**: Phase 3 - M4 QA & Handover  
**Context7 Source**: Next.js Official Documentation Patterns

## Next.js Environment Variables Best Practices

### Public vs Server Environment Variables

#### Public Environment Variables (Client-Side Access)
```bash
# These are exposed to the client and can be accessed via process.env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Server-Only Environment Variables (Security)
```bash
# These are only available server-side and NOT exposed to client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/aiostore
```

### Environment Variable Security Rules

#### ✅ DO: Use Public Variables for Client Operations
```javascript
// Safe: Client-side operations with anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### ❌ DON'T: Expose Service Role Keys
```javascript
// UNSAFE: Never expose service role keys in client code
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // This would be exposed!
```

### Phase 3 Environment Configuration

#### Required Variables for AIOStore Phase 3
```bash
# Supabase Configuration (Phase 2 & 3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Write Mode Configuration (Phase 3)
WRITE_MODE=dry                    # Options: dry | live (default: dry)

# Data Source Configuration (Phase 2)
DATA_SOURCE_PRODUCTS=supabase     # Options: mock | supabase
DATA_SOURCE_ORDERS=supabase       # Options: mock | supabase
DATA_SOURCE_CUSTOMERS=mock        # Options: mock | supabase
DATA_SOURCE_TRANSACTIONS=mock     # Options: mock | supabase
DATA_SOURCE_MESSAGES=mock         # Options: mock | supabase
```

### Environment Variable Usage in Code

#### Supabase Client Configuration
```typescript
// src/lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

#### Write Mode Configuration
```typescript
// src/lib/data-sources.ts
export type WriteMode = 'dry' | 'live'

const DEFAULT_WRITE_MODE: WriteMode = (process.env.WRITE_MODE as WriteMode) || 'dry'
```

### Security Best Practices

#### 1. Never Commit Actual Keys
```bash
# ✅ CORRECT: Use placeholder values in .env.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ❌ WRONG: Never commit real keys
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Environment-Specific Configuration
```bash
# Development (.env.local)
WRITE_MODE=dry
DATA_SOURCE_PRODUCTS=mock

# Production (.env.production)
WRITE_MODE=live
DATA_SOURCE_PRODUCTS=supabase
```

#### 3. Access Control
- **Public variables**: Can be accessed in client components
- **Private variables**: Only available in server-side code (API routes, getServerSideProps)
- **Build-time variables**: Required during `npm run build`

### Next.js Environment Variable Loading

#### Order of Precedence
1. **`.env.local`** - User-specific overrides (not committed to git)
2. **`.env.production`** - Production environment variables  
3. **`.env.development`** - Development environment variables
4. **`.env`** - General fallback (not recommended)

#### File Structure
```
aiostore/
├── .env.example          # Template with placeholders
├── .env.local           # Your local overrides (gitignored)
├── .env.development     # Dev-specific variables
├── .env.production      # Production-specific variables
└── .env                 # General fallback (optional)
```

### Phase 3 Environment Setup

#### Development Environment
```bash
# Copy from template
cp .env.example .env.local

# Configure for development
NEXT_PUBLIC_SUPABASE_URL=https://your-project-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
WRITE_MODE=dry  # Always start with dry mode
DATA_SOURCE_PRODUCTS=supabase
DATA_SOURCE_ORDERS=supabase
```

#### Production Environment
```bash
# Configure for production
NEXT_PUBLIC_SUPABASE_URL=https://your-project-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
WRITE_MODE=live  # Only after testing thoroughly
DATA_SOURCE_PRODUCTS=supabase
DATA_SOURCE_ORDERS=supabase
```

### Environment Validation

#### Runtime Validation
```typescript
// src/lib/supabase.ts
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Please check your .env.local file.')
  console.warn('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
```

#### Build-Time Validation
```typescript
// next.config.js
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
```

### Environment Variables in Different Contexts

#### Client Components
```typescript
// ✅ Can access public variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// ❌ Cannot access server variables
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // undefined
```

#### API Routes (Server-Side)
```typescript
// ✅ Can access both public and private variables
export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Available server-side
}
```

#### getServerSideProps
```typescript
// ✅ Server-side context provides all variables
export async function getServerSideProps(context) {
  const { req } = context
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
}
```

## Environment Variable Security Checklist

- [ ] ✅ No real secrets in `.env.example`
- [ ] ✅ `.env.local` in `.gitignore`
- [ ] ✅ Public variables prefixed with `NEXT_PUBLIC_`
- [ ] ✅ Private variables never used in client code
- [ ] ✅ Environment-specific configuration
- [ ] ✅ Runtime validation for required variables
- [ ] ✅ Service role keys only in server-side code

## Troubleshooting

### Common Issues

#### "Missing environment variables"
```bash
# Check if file exists
ls -la .env.local

# Verify content
cat .env.local

# Restart development server after changes
npm run dev
```

#### "Invalid environment variable"
```typescript
// Validate variable format
const writeMode = process.env.WRITE_MODE as 'dry' | 'live'
if (!writeMode || !['dry', 'live'].includes(writeMode)) {
  throw new Error('Invalid WRITE_MODE environment variable')
}
```

#### "Environment variable not accessible"
```typescript
// Ensure correct prefix for client-side access
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL) // ✅ Works
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY) // ❌ undefined in client
```

**Note**: This documentation follows Next.js best practices and security guidelines for environment variable management in production applications.