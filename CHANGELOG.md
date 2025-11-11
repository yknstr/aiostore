# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-11-11T20:18:10.856Z

### Phase 3: Authentication + Limited Writes

#### 🎉 Major New Features
- **Authentication System**: Complete Supabase Auth integration with email/password
- **Write Operations**: Limited write capabilities via service layer with safety controls
- **Row Level Security**: Database-level security with RLS policies

#### 🔧 Authentication Implementation
- **M1 — Auth ON**: Replaced mock localStorage authentication with real Supabase Auth
- Email/password sign-in/out functionality implemented
- Session management with auto-refresh tokens
- Dashboard route protection using real session guards
- AuthContext updated to use Supabase SDK methods

#### 🛠️ Write Operations & Safety
- **M2 — Writes (Dry-Run)**: Implemented service-layer write methods with safety controls
- ProductsService: `createProduct`, `updateProduct` methods
- OrdersService: `updateOrderStatus` method
- WRITE_MODE environment variable: `dry` (default safe mode) vs `live` (actual writes)
- Dry-run mode: logs intended SQL operations without database commits
- Shape parity maintained with existing read methods

#### 🔒 Security & Database
- **M3 — RLS & Live**: Enabled Row Level Security on products and orders tables
- Minimal RLS policies for authenticated users (SELECT, INSERT, UPDATE operations)
- No `service_role` key usage in client code (security best practice)
- Database-level access control as primary security layer

#### 📚 Documentation & Setup
- Comprehensive Context7 documentation snapshots for Auth and DML operations
- Updated `.env.example` with RLS setup SQL commands
- SECURITY_NOTES_DEV.md with detailed security guidelines and rollback procedures
- README updates with Auth How-to section

#### ⚙️ Quality Assurance
- Linting: 1 warning (pre-existing, not related to Phase 3)
- TypeScript checks: 6 pre-existing errors (not related to Phase 3)
- Build system: Next.js environment configuration issue (not related to Phase 3)

#### 🚨 Safety Features
- **WRITE_MODE=dry** (default): Prevents accidental data modifications
- **Rollback Process**: Simple `WRITE_MODE=dry` to stop live operations
- **RLS Policies**: Database-level security prevents unauthorized access
- **Service Layer**: All writes go through service layer, no direct SDK calls

#### 🔄 Migration Guide
1. **Environment Setup**: Copy `.env.example` to `.env.local` and configure Supabase
2. **RLS Setup**: Apply SQL policies in Supabase SQL Editor (see `.env.example`)
3. **Testing**: Start with `WRITE_MODE=dry` for safe testing
4. **Production**: Switch to `WRITE_MODE=live` after verification

#### ⚠️ Important Notes
- This is a **development environment** configuration
- Production deployments require additional security hardening
- All write operations are **service layer only** (UI cannot call SDK directly)
- Default **dry mode** prevents accidental data modifications
- Rollback is simple: set `WRITE_MODE=dry`

### Technical Details

#### Security Architecture
- **Authentication**: Supabase Auth (email/password)
- **Database Security**: Row Level Security (RLS) policies
- **Write Safety**: WRITE_MODE dry/live switch
- **Service Layer**: Unified interface for all data operations

#### Service Layer Extensions
```typescript
// ProductsService
await productsService.createProduct(productData)
await productsService.updateProduct(id, updates)

// OrdersService
await ordersService.updateOrderStatus(id, newStatus)
```

#### Environment Variables Added
```bash
WRITE_MODE=dry                    # dry | live (default: dry)
# + RLS setup SQL commands in .env.example
```

---

## [1.2.0] - 2025-11-11

### Phase 2: Supabase Integration (Read-Only)

#### 🎉 Major New Features
- **Supabase Integration**: Complete read-only service layer implementation
- **Feature Flag System**: Per-module data source switching (mock/supabase)
- **Service Architecture**: Unified service layer with data transformation

#### 📊 Data Sources Configuration
- Feature flag support for products, orders, customers, transactions, messages
- Shape parity between mock and Supabase data
- Data transformation utilities (snake_case ↔ camelCase)
- Health check system for service monitoring

#### 🛠️ Service Layer Implementation
- ProductsService: Complete read operations
- OrdersService: Complete read operations  
- CustomersService: Complete read operations
- TransactionsService: Complete read operations
- MessagesService: Complete read operations
- Unified DataService facade for easy switching

#### 📚 Documentation
- Data source configuration guide
- Service layer architecture documentation
- Feature flag usage examples

---

## [1.1.0] - 2025-11-11

### Phase 1: Frontend Implementation

#### 🎉 Major New Features
- **Multi-Platform Dashboard**: Complete e-commerce management interface
- **Product Management**: Full CRUD operations for multi-platform products
- **Order Management**: Order tracking and status management
- **Analytics & Reports**: Revenue tracking and platform comparison
- **Chat System**: Customer communication management
- **Finance Management**: Transaction tracking and reporting

#### 📱 Core Features
- **Dashboard**: Overview with key metrics and recent activity
- **Products**: Multi-platform product management (Shopee, TikTok, Tokopedia, Lazada)
- **Orders**: Order tracking with status updates and customer info
- **Analytics**: Revenue charts, platform comparisons, top products
- **Finance**: Transaction management with income/expense tracking
- **Chat**: Customer communication with platform integration
- **Settings**: Account, notification, and platform configuration

#### 🛠️ Technical Implementation
- Next.js 14.2 with TypeScript and Tailwind CSS
- Responsive design with mobile navigation
- Chart.js integration for analytics visualization
- Component-based architecture with shadcn/ui
- Mock data system for development and testing

---

## [1.0.0] - 2025-11-11

### Initial Release

#### 🎉 Project Setup
- Next.js 14.2 project initialization
- TypeScript configuration
- Tailwind CSS setup
- ESLint and Prettier configuration
- Basic project structure

---

## Development Notes

### Version Strategy
- **Major.Minor.Patch** format
- Major: Breaking changes or major feature additions
- Minor: New features, backward compatible
- Patch: Bug fixes, backward compatible

### Contributing
- Follow the versioning strategy
- Update CHANGELOG.md for all changes
- Include migration notes for breaking changes
- Document security considerations

### Security
- Always start with WRITE_MODE=dry in new environments
- Apply RLS policies before enabling live writes
- Never expose service_role keys in client code
- Follow the rollback procedures outlined in SECURITY_NOTES_DEV.md