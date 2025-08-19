# Mini App Template - Technical Specification

## Executive Summary

Build a comprehensive template application that serves as a foundation for AI-generated mini-apps. The template focuses on data orchestration, visualization, and API integration patterns, enabling rapid development of dashboards and reporting applications.

---

## Project Overview

### Objective
Create a full-featured template application demonstrating all common patterns needed for building data-driven dashboards and reports. This template will be used by AI agents to generate new applications by following established patterns.

### Technology Stack
- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js with Express
- **Database**: SQLite (development mode) / API calls (production mode)
- **Authentication**: External auth service with JWT tokens
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts or Chart.js
- **State Management**: React Context API + React Query

### Key Requirements
1. Dual-mode operation (SQLite for development, APIs for production)
2. Token-based authentication with automatic refresh
3. Comprehensive error handling and loading states
4. Multiple visualization and data patterns
5. Clean separation of concerns
6. Production-ready folder structure

---

## User Stories and Implementation Tasks

### Epic 1: Project Setup and Structure

#### User Story 1.1: Initial Project Setup
**As a** developer  
**I want** a properly structured monorepo  
**So that** frontend and backend code are organized but deployable as one unit

**Acceptance Criteria:**
- Single repository with /frontend and /backend folders
- Shared TypeScript interfaces in /shared folder
- Single npm command to run both frontend and backend
- Environment-based configuration

**Tasks:**
1. Initialize npm workspace with three packages (frontend, backend, shared)
2. Setup TypeScript configuration for all packages
3. Configure Vite for frontend with React and TypeScript
4. Setup Express server with TypeScript for backend
5. Create shared interfaces folder with base types
6. Setup environment variables structure (.env.example)
7. Configure package.json scripts for development and production
8. Setup ESLint and Prettier for code consistency

**Technical Implementation:**
```
/mini-app-template
├── /frontend
│   ├── /src
│   │   ├── /api
│   │   ├── /components
│   │   ├── /features
│   │   ├── /hooks
│   │   ├── /utils
│   │   └── /types
│   ├── /dist              (generated on build)
│   ├── vite.config.ts
│   └── package.json
├── /backend
│   ├── /src
│   │   ├── /routes
│   │   ├── /services
│   │   ├── /middleware
│   │   └── server.js      (serves both API and frontend)
│   └── package.json
├── /shared
│   └── /interfaces
└── package.json (workspace root)
```

**Backend Server Configuration:**
```javascript
// backend/src/server.js
import express from 'express';
import path from 'path';

const app = express();
const BASE_PATH = process.env.NODE_ENV === 'production' 
  ? '/miniapp/appname' 
  : '/miniappsdev/appname';

// Serve static files from frontend build
app.use(`${BASE_PATH}`, express.static(path.join(__dirname, '../../frontend/dist')));

// API routes
app.use(`${BASE_PATH}/api`, apiRoutes);

// Catch-all: serve React app for client-side routes
app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Important: Do NOT listen on separate frontend port
app.listen(8101); // Single port for everything
```

**Frontend Build Configuration:**
```javascript
// frontend/vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/miniappsdev/appname/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

**Environment-based App Configuration:**
```javascript
// config/app.config.ts
export const APP_CONFIG = {
  appName: process.env.VITE_APP_NAME || 'appname',
  basePath: process.env.NODE_ENV === 'production' 
    ? `/miniapp/${process.env.VITE_APP_NAME}/`
    : `/miniappsdev/${process.env.VITE_APP_NAME}/`,
  apiBase: process.env.NODE_ENV === 'production'
    ? `/miniapp/${process.env.VITE_APP_NAME}/api`
    : `/miniappsdev/${process.env.VITE_APP_NAME}/api`
};
```

**Unified Development Workflow:**
```bash
# Development (single process - same as production)
npm run dev                    # Build frontend → start backend (serves dist/ + API)
npm run dev:watch             # Above + watch frontend for changes

# Production build and serve
npm run build                 # Build shared, frontend, backend
npm start                    # Start backend (serves everything on single port)

# Both development and production serve on: http://localhost:8101/miniappsdev/myapp/
```

---

### Epic 2: Authentication Integration

#### User Story 2.1: Token Management for API Calls
**As a** developer  
**I want** to use Bearer tokens for API calls  
**So that** I can access protected company APIs

**Acceptance Criteria:**
- Fetch token from `/miniappsdev/auth/token` endpoint
- Cache token with expiry time
- Refresh token when needed (before expiry)
- Add Bearer token to all external API calls
- User info available from request headers

**Tasks:**
1. Create TokenManager class to handle token lifecycle
2. Implement token caching with expiry checking
3. Create useUser hook to read headers (X-User-Email, X-User-Name, X-User-Id)
4. Setup axios interceptor to add Bearer token to external API calls
5. Implement token refresh logic (fetch new token before expiry)
6. Create API client wrapper with automatic token injection
7. Handle 401 responses by refreshing token and retrying
8. Add user context provider using header information

**Code Structure Required:**
```typescript
// /frontend/src/utils/TokenManager.ts
class TokenManager {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  
  async getToken(): Promise<string> {
    if (!this.token || Date.now() > this.tokenExpiry - 60000) {
      const response = await fetch('/miniappsdev/auth/token');
      const data = await response.json();
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    }
    return this.token;
  }
}

// /frontend/src/hooks/useUser.ts
function useUser() {
  // Read from meta tags or initial props passed from backend
  // Backend should inject headers into initial HTML
  return {
    id: window.__USER__.id,
    email: window.__USER__.email,
    name: window.__USER__.name
  };
}
```

---

### Epic 3: Data Service Layer

#### User Story 3.1: Dual-Mode for CRUD Operations Only
**As a** developer  
**I want** to use SQLite for CRUD in dev mode  
**So that** I can develop without backend dependencies for user-created data

**Acceptance Criteria:**
- SQLite used ONLY for entities that users create/update/delete
- All dashboard and report data comes from real APIs
- Environment variable controls CRUD data source only
- Real APIs always require Bearer token authentication

**Tasks:**
1. Create CRUDProvider interface for user-managed entities
2. Implement SQLiteCRUDProvider for development (local entities only)
3. Implement APICRUDProvider for production
4. Create separate APIClient for real company APIs (always used)
5. Setup SQLite for CRUD entities only (users, preferences, saved filters)
6. Implement Bearer token injection for all API calls
7. Create clear separation between CRUD and read-only API calls
8. Add mock delay to SQLite operations for realistic feel

**Implementation Pattern:**
```typescript
// /backend/src/services/CRUDProvider.ts
// This is ONLY for user-created entities
interface CRUDProvider {
  createEntity(data: Entity): Promise<Entity>;
  updateEntity(id: string, data: Entity): Promise<Entity>;
  deleteEntity(id: string): Promise<void>;
  getEntity(id: string): Promise<Entity>;
  listEntities(filters: FilterParams): Promise<Entity[]>;
}

// /frontend/src/services/APIClient.ts
// This is for ALL dashboard/report data from company APIs
class APIClient {
  private tokenManager: TokenManager;
  
  async fetchDashboardData(): Promise<DashboardData> {
    const token = await this.tokenManager.getToken();
    return fetch('https://api.company.com/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  
  async fetchReportData(reportId: string): Promise<ReportData> {
    const token = await this.tokenManager.getToken();
    return fetch(`https://api.company.com/reports/${reportId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

**Important Note**: 
- SQLite is ONLY for development convenience for CRUD operations
- ALL analytical data, metrics, reports come from real APIs
- Bearer token required for all external API calls

---

### Epic 4: Navigation and Layout

#### User Story 4.1: Modern Two-Level Navigation
**As a** user  
**I want** intuitive navigation with menu and submenus  
**So that** I can easily access all features

**Acceptance Criteria:**
- Responsive sidebar navigation
- Two-level menu structure (parent items with children)
- Collapsible menu groups
- Active state indicators
- Breadcrumb navigation
- Mobile-responsive hamburger menu
- Keyboard navigation support
- Remember expanded/collapsed state

**Tasks:**
1. Create Layout component with sidebar and main content area
2. Build NavigationMenu component with two-level support
3. Implement menu configuration system
4. Add active route highlighting
5. Create collapsible menu groups with smooth animations
6. Build breadcrumb component that auto-generates from routes
7. Implement mobile navigation drawer
8. Add keyboard navigation (arrow keys, enter, escape)
9. Create user preference storage for menu state
10. Add menu search/filter functionality
11. Implement icon support for menu items
12. Add badge/notification support for menu items

**Menu Configuration Structure:**
```typescript
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  path?: string;
  badge?: number | string;
  children?: MenuItem[];
  permissions?: string[];
}

const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    id: 'data',
    label: 'Data Management',
    icon: Database,
    children: [
      {
        id: 'entities',
        label: 'Entities',
        path: '/entities',
        badge: 'New'
      },
      {
        id: 'import',
        label: 'Import/Export',
        path: '/data/import-export'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    children: [
      {
        id: 'sales',
        label: 'Sales Reports',
        path: '/reports/sales'
      },
      {
        id: 'inventory',
        label: 'Inventory Reports',
        path: '/reports/inventory'
      },
      {
        id: 'custom',
        label: 'Custom Reports',
        path: '/reports/custom',
        badge: 3
      }
    ]
  }
];
```

**Layout Pattern:**
```
┌─────────────────────────────────────────────┐
│  Header (logo, user menu, notifications)    │
├────────────┬────────────────────────────────┤
│            │  Breadcrumb: Home > Reports    │
│  Sidebar   ├────────────────────────────────┤
│            │                                 │
│  ▼ Data    │                                 │
│    Entities│      Main Content Area         │
│    Import  │                                 │
│            │                                 │
│  ▶ Reports │                                 │
│            │                                 │
└────────────┴────────────────────────────────┘
```

---

### Epic 5: Dashboard Feature

#### User Story 5.1: Multi-Widget Dashboard
**As a** user  
**I want** a dashboard with multiple data widgets  
**So that** I can see key metrics at a glance

**Acceptance Criteria:**
- Dashboard loads 6+ widgets asynchronously
- Each widget has loading and error states
- Widgets refresh independently
- Responsive grid layout
- Export dashboard as PDF

**Tasks:**
1. Create DashboardLayout component with CSS Grid
2. Build KPICard component with trend indicators
3. Implement ChartWidget wrapper component
4. Create DataTable widget with sorting
5. Add AsyncWidget HOC for loading/error states
6. Implement parallel data fetching with Promise.all
7. Add refresh functionality per widget
8. Build PDF export using jsPDF
9. Create widget configuration system
10. Implement drag-and-drop widget reordering

**Widget Types Required:**
- KPI Card (number + trend + sparkline)
- Line Chart (time series)
- Bar Chart (categories)
- Pie Chart (distribution)
- Data Table (top 10 items)
- Heat Map (matrix data)

---

### Epic 6: Advanced Data Grid

#### User Story 6.1: Full-Featured Data Grid
**As a** user  
**I want** a powerful data grid  
**So that** I can explore and analyze data efficiently

**Acceptance Criteria:**
- Server-side pagination
- Column sorting (multi-column)
- Advanced filtering per column
- Global search
- Column visibility toggle
- Export to CSV/Excel
- Row selection for bulk operations
- Infinite scroll option

**Tasks:**
1. Create DataGrid component with virtualization
2. Implement pagination controls
3. Build column header with sort indicators
4. Create filter row with input types per column
5. Add global search with debouncing
6. Implement column visibility menu
7. Build export functionality (CSV and Excel)
8. Add row selection with checkboxes
9. Create bulk operations toolbar
10. Implement keyboard navigation
11. Add column resizing
12. Create saved views feature

**Advanced Features:**
```typescript
interface GridConfig {
  columns: ColumnDef[];
  enablePagination: boolean;
  enableSorting: boolean;
  enableFiltering: boolean;
  enableExport: boolean;
  enableSelection: boolean;
  serverSide: boolean;
  pageSize: number;
}
```

---

### Epic 7: CRUD Operations

#### User Story 7.1: Complete CRUD Flow
**As a** user  
**I want** to create, read, update, and delete records  
**So that** I can manage data

**Acceptance Criteria:**
- List view with inline actions
- Modal forms for create/edit
- Confirmation dialogs for delete
- Optimistic updates with rollback
- Form validation with error messages
- Success/error notifications

**Tasks:**
1. Create ListPage component with actions
2. Build FormModal component (reusable)
3. Implement form validation with Yup
4. Add optimistic update logic
5. Create confirmation dialog component
6. Build toast notification system
7. Implement undo functionality
8. Add form field components (text, select, date, etc.)
9. Create file upload component
10. Build multi-step form example

---

### Epic 8: Data Orchestration Patterns

#### User Story 8.1: API Composition
**As a** developer  
**I want** examples of complex API orchestration  
**So that** AI can learn to combine data sources

**Acceptance Criteria:**
- Parallel API calls example
- Sequential dependent calls example
- Data joining from multiple sources
- Fallback strategies for failed calls
- Response transformation examples

**Tasks:**
1. Create APIOrchestrator service
2. Implement parallel fetching pattern
3. Build sequential dependency resolver
4. Create data joining utilities
5. Add response transformation pipeline
6. Implement caching with TTL
7. Build retry logic with exponential backoff
8. Create data aggregation utilities
9. Add computed fields calculator
10. Implement cross-API data validation

**Patterns to Include:**
```typescript
// Parallel fetching
const [sales, inventory, customers] = await Promise.all([
  fetchSales(),
  fetchInventory(), 
  fetchCustomers()
]);

// Sequential with dependency
const user = await fetchUser();
const permissions = await fetchPermissions(user.roleId);
const dashboards = await fetchDashboards(permissions);

// Join data from multiple APIs
const enrichedOrders = joinData(
  orders,
  customers,
  'customerId',
  'id'
);
```

---

### Epic 9: Visualization Components

#### User Story 9.1: Reusable Chart Library
**As a** developer  
**I want** a library of chart components  
**So that** AI can easily create visualizations

**Acceptance Criteria:**
- 10+ chart types available
- Consistent API across all charts
- Responsive and interactive
- Customizable colors and styles
- Export charts as images

**Tasks:**
1. Create BaseChart HOC
2. Build LineChart component
3. Build BarChart component
4. Build PieChart component
5. Build AreaChart component
6. Build ScatterPlot component
7. Build HeatMap component
8. Build TreeMap component
9. Build Gauge component
10. Build Sparkline component
11. Add chart export functionality
12. Create chart configuration builder

---

### Epic 10: Error Handling & Loading States

#### User Story 10.1: Comprehensive Error Handling
**As a** user  
**I want** clear feedback when things go wrong  
**So that** I understand what's happening

**Acceptance Criteria:**
- Global error boundary
- Network error handling
- Timeout handling
- Retry mechanisms
- User-friendly error messages
- Error logging system

**Tasks:**
1. Create ErrorBoundary component
2. Build error notification system
3. Implement network error interceptor
4. Add timeout handling for API calls
5. Create retry button components
6. Build error logging service
7. Add offline detection
8. Create fallback UI components
9. Implement progressive degradation
10. Add error recovery strategies

---

### Epic 11: Performance Optimization

#### User Story 11.1: Optimized Data Loading
**As a** user  
**I want** fast and responsive application  
**So that** I have a smooth experience

**Acceptance Criteria:**
- Lazy loading for routes
- Data caching strategy
- Debounced inputs
- Virtualized lists for large data
- Optimized re-renders

**Tasks:**
1. Implement React.lazy for code splitting
2. Setup React Query for caching
3. Add debouncing for search inputs
4. Implement virtual scrolling for lists
5. Add memo optimization for components
6. Create performance monitoring
7. Implement stale-while-revalidate
8. Add request deduplication
9. Build progressive data loading
10. Optimize bundle size

---

### Epic 12: Utilities and Helpers

#### User Story 12.1: Utility Function Library
**As a** developer  
**I want** a comprehensive utility library  
**So that** AI has helpers for common tasks

**Acceptance Criteria:**
- Date formatting utilities
- Number formatting utilities
- Data transformation helpers
- Validation functions
- API helpers

**Tasks:**
1. Create date utility functions
2. Build number formatting utilities
3. Add currency formatters
4. Create data transformation helpers
5. Build validation utility library
6. Add API request builders
7. Create local storage helpers
8. Build URL parameter utilities
9. Add array/object utilities
10. Create type guards

**Utility Categories:**
```typescript
// /frontend/src/utils/
├── dateUtils.ts       // Date formatting, parsing, calculations
├── numberUtils.ts     // Number formatting, calculations
├── dataUtils.ts       // Transform, aggregate, filter
├── validationUtils.ts // Form and data validation
├── apiUtils.ts        // Request builders, interceptors
├── storageUtils.ts    // Local storage, session storage
└── typeGuards.ts      // TypeScript type guards
```

---

## Testing Requirements

### Unit Tests
- Component testing with React Testing Library
- Service layer testing with Jest
- Utility function testing
- 80% code coverage target

### Integration Tests
- API integration tests
- Auth flow testing
- Data flow testing

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile responsive testing

---

## Performance Requirements

- Initial load time: < 3 seconds
- API response time: < 500ms (mock mode)
- Time to interactive: < 5 seconds
- Lighthouse score: > 90

---

## Documentation Requirements

1. **README.md** with setup instructions
2. **Component Storybook** for UI components
3. **API documentation** with examples
4. **Pattern guide** for common scenarios
5. **Environment setup guide**
6. **Deployment guide**

---

## Deliverables Checklist

### Core Features
- [ ] Project structure with frontend/backend
- [ ] Authentication system with token refresh
- [ ] Dual-mode data provider (SQLite/API)
- [ ] Dashboard with 6+ widget types
- [ ] Advanced data grid with all features
- [ ] CRUD operations with modals
- [ ] 10+ chart components
- [ ] Error handling system
- [ ] Loading states and skeletons
- [ ] Toast notifications

### Data Patterns
- [ ] Parallel API calls
- [ ] Sequential dependent calls
- [ ] Data joining utilities
- [ ] Aggregation functions
- [ ] Caching implementation
- [ ] Retry logic
- [ ] Fallback strategies

### UI Components
- [ ] Form components (10+ types)
- [ ] Modal system
- [ ] Navigation (sidebar, breadcrumb)
- [ ] Data tables
- [ ] Cards and widgets
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Empty states

### Utilities
- [ ] Date utilities
- [ ] Number formatters
- [ ] Data transformers
- [ ] Validation helpers
- [ ] API utilities
- [ ] Type guards

### Configuration
- [ ] Environment variables
- [ ] Build configuration
- [ ] Deployment scripts
- [ ] Docker support

---

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Project setup and structure
2. Basic Express server
3. Frontend setup with Vite
4. Shared interfaces
5. Environment configuration

### Phase 2: Core Systems (Week 2)
1. Authentication system
2. Data provider abstraction
3. SQLite setup with seed data
4. API service layer
5. Error handling framework

### Phase 3: UI Components (Week 3)
1. Layout components
2. Form components
3. Data grid
4. Chart components
5. Loading/error states

### Phase 4: Features (Week 4)
1. Dashboard implementation
2. CRUD operations
3. Data orchestration examples
4. Advanced grid features
5. Export functionality

### Phase 5: Polish (Week 5)
1. Performance optimization
2. Testing
3. Documentation
4. Demo data
5. Deployment setup

---

## Success Criteria

1. **Completeness**: All user stories implemented
2. **Code Quality**: Clean, maintainable, well-documented
3. **Performance**: Meets performance benchmarks
4. **Reusability**: Components easily extractable
5. **AI-Friendly**: Clear patterns for AI to learn from
6. **Production-Ready**: Deployable without modifications

---

## Appendix A: Sample API Endpoints

### Mock CRUD Endpoints (SQLite in dev, real API in prod)
```
GET    /miniappsdev/appname/api/entities            # List user-created entities
GET    /miniappsdev/appname/api/entities/:id        # Get single entity
POST   /miniappsdev/appname/api/entities            # Create entity
PUT    /miniappsdev/appname/api/entities/:id        # Update entity
DELETE /miniappsdev/appname/api/entities/:id        # Delete entity
GET    /miniappsdev/appname/api/user-preferences    # User settings
PUT    /miniappsdev/appname/api/user-preferences    # Update settings
```

### Real API Endpoints (ALWAYS from company APIs with Bearer token)
```
GET    https://api.company.com/dashboard/widgets     # Dashboard data
GET    https://api.company.com/metrics/sales        # Sales metrics
GET    https://api.company.com/reports/inventory    # Inventory reports
GET    https://api.company.com/analytics/trends     # Trend analysis
GET    https://api.company.com/data/export         # Export data
POST   https://api.company.com/reports/generate    # Generate report
```

### Auth Endpoint (provided by auth service through NGINX)
```
GET    /miniappsdev/auth/token   # Get/refresh Bearer token
```

### Frontend Routes (React Router)
```
/miniappsdev/appname/                    # Home/Dashboard
/miniappsdev/appname/dashboard           # Dashboard view
/miniappsdev/appname/grid               # Data grid view
/miniappsdev/appname/entities           # CRUD list view
/miniappsdev/appname/entities/:id       # CRUD detail view
/miniappsdev/appname/reports            # Reports view
```

---

## Appendix B: Environment Variables

```bash
# Frontend (.env.development)
VITE_APP_NAME=myapp
VITE_BASE_PATH=/miniappsdev/myapp/
VITE_API_BASE=/miniappsdev/myapp/api
VITE_AUTH_TOKEN_URL=/miniappsdev/auth/token
VITE_USE_MOCK_CRUD=true

# Frontend (.env.production)
VITE_APP_NAME=myapp
VITE_BASE_PATH=/miniapp/myapp/
VITE_API_BASE=/miniapp/myapp/api
VITE_AUTH_TOKEN_URL=/miniapp/auth/token
VITE_USE_MOCK_CRUD=false

# Backend (.env)
NODE_ENV=development
PORT=8101
APP_NAME=myapp
BASE_PATH=/miniappsdev/myapp
USE_MOCK_CRUD=true
DATABASE_PATH=./data/mock.db
CORS_ORIGIN=http://localhost:5173
```

---

## Appendix C: TypeScript Interfaces

```typescript
// Core interfaces to implement
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  metadata?: {
    page?: number;
    totalPages?: number;
    totalItems?: number;
  };
}

interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'custom';
  title: string;
  data: any;
  config: WidgetConfig;
  refreshInterval?: number;
}
```

---

## Notes for ClaudeCode

1. **Start with the project structure** - Get the foundation right
2. **Focus on patterns over features** - Quality over quantity
3. **Make everything configurable** - No hardcoded values
4. **Include error scenarios** - Show how to handle failures
5. **Document as you build** - Comments and JSDoc
6. **Use TypeScript strictly** - No 'any' types
7. **Follow React best practices** - Hooks, composition, performance
8. **Make it production-ready** - This is a reference implementation

## Appendix D: Authentication Flow Diagram

```
User Access Flow (Already Handled by NGINX):
============================================
User → Browser → NGINX (8086) → Mini-App (8101)
                     ↓
            [Auth Check by NGINX]
                     ↓
        If not authenticated: Redirect to /miniappsdev/auth/login
        If authenticated: Add headers and forward request
                     ↓
            Mini-App receives:
            - X-User-Id: "123"
            - X-User-Email: "user@company.com"  
            - X-User-Name: "John Doe"

API Call Flow (App Responsibility):
====================================
Mini-App needs data from company API
                ↓
    fetch('/miniappsdev/auth/token')
                ↓
    Receive: { access_token: "...", expires_in: 3600 }
                ↓
    fetch('https://api.company.com/data', {
        headers: { 'Authorization': 'Bearer ${token}' }
    })
                ↓
    Receive data and display
```

## Appendix E: Data Architecture Clarification

```
Two Distinct Data Sources:
==========================

1. CRUD Operations (Dual-Mode):
   Development: SQLite (local database)
   Production: Company CRUD API
   Used for: User-created entities, preferences, saved views
   
2. Analytics/Reports (Always Real APIs):
   Development: Real company APIs (with Bearer token)
   Production: Same real company APIs
   Used for: Dashboards, metrics, reports, analytics
   
Example Code Structure:
-----------------------
// For CRUD operations (dual-mode)
const entity = await crudProvider.createEntity(data);  // SQLite or API

// For dashboard data (always real API)
const token = await tokenManager.getToken();
const dashboard = await fetch('https://api.company.com/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

This template will serve as the foundation for AI-generated mini-apps. The comprehensive patterns and examples will enable AI agents to quickly understand and replicate common application scenarios while maintaining code quality and best practices.