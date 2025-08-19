# Mini App Template

A comprehensive template for building data-driven mini-applications with React, Node.js, and TypeScript. This template demonstrates common patterns for dashboards, CRUD operations, and data orchestration that AI agents can learn from and replicate.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start application (single process serves both frontend and API)
npm run dev
```

The application will be available at:
- **Application**: http://localhost:8101/miniappsdev/myapp/
- **API Endpoints**: http://localhost:8101/miniappsdev/myapp/api
- **Mock Company API**: http://localhost:3001

## Architecture

```
├── frontend/          # React + TypeScript + Vite (builds to dist/)
├── backend/           # Node.js + Express + TypeScript (serves dist/ + API)
├── shared/            # Shared TypeScript interfaces
├── mock-api/          # Mock company API (separate service)
└── package.json       # Workspace configuration
```

## Unified Development Workflow

**Single Process Architecture**: Both development and production use the same workflow - the backend Express server serves both the built frontend and API endpoints on port 8101.

```bash
# Development workflow
npm run dev              # Build frontend once, serve via backend
npm run dev:watch        # Same as above + watch frontend changes

# Production workflow  
npm run build           # Build everything for production
npm start              # Start backend (serves built frontend + API)
```

## Key Features

- **Single Process**: Backend serves both frontend and API (no separate dev server)
- **Dual-Mode Data**: SQLite for CRUD (dev), real APIs for analytics (always)
- **Authentication**: JWT token management with auto-refresh
- **Dashboard**: Multi-widget dashboard with charts and KPIs
- **Advanced Grid**: Full-featured data table with sorting, filtering, export
- **CRUD Operations**: Complete create/read/update/delete workflows
- **Charts Library**: 10+ reusable chart components
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Lazy loading, caching, and optimization patterns

## Development Options

```bash
# Standard development (recommended)
npm run dev              # Build frontend → start backend + mock API

# Development with frontend watching
npm run dev:watch        # Above + rebuild frontend on changes

# Run services individually (if needed)
npm run dev:backend      # Just the backend
npm run dev:mock-api     # Just the mock API
```

## Environment Configuration

The app supports dual environments:
- **Development**: `/miniappsdev/myapp/` with SQLite for CRUD
- **Production**: `/miniapp/myapp/` with real APIs for everything

## Documentation

See `CLAUDE.md` for detailed technical specification and implementation guidance.