# WiNet API - Replit Project

## Overview
WiNet is a minimal NestJS 10 API project that provides a basic health check endpoint. This project was imported from GitHub and configured to run in the Replit environment.

**Current Status**: API is running and functional on port 5000

## Project Structure
```
/
├── backend/
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── app.controller.ts  # Main controller with health endpoint
│       │   │   ├── app.module.ts      # Root module
│       │   │   └── app.service.ts     # App service
│       │   └── main.ts                # Application entry point
│       ├── package.json               # Node.js dependencies
│       └── tsconfig.json              # TypeScript configuration
├── docs/
│   └── openapi.yml                    # API documentation
├── routeros/
│   └── scripts/
│       └── bootstrap_template.rsc     # RouterOS bootstrap script
└── docker-compose.yml                 # Docker Postgres setup (not used in Replit)
```

## Recent Changes (October 24, 2025)
- **Replit Setup**: Configured project to run in Replit environment
- **Port Configuration**: Updated to bind to 0.0.0.0:5000 for Replit proxy compatibility
- **Dependencies**: Fixed @nestjs/axios version from ^10.0.0 to ^3.0.0
- **Workflow**: Created API Server workflow using ts-node-dev for hot reload
- **Build System**: TypeScript compilation configured with NestJS

## Technology Stack
- **Framework**: NestJS 10
- **Language**: TypeScript 5.4
- **Runtime**: Node.js 20
- **Package Manager**: npm
- **Dev Tool**: ts-node-dev (hot reload)

## API Endpoints
- `GET /` - Root endpoint (returns service info)
- `GET /health` - Health check endpoint (returns status and timestamp)

## Development
The API runs in development mode with hot reload enabled. Any changes to TypeScript files will automatically restart the server.

**Port**: 5000  
**Host**: 0.0.0.0 (required for Replit proxy)

## Deployment
Configured for Replit autoscale deployment with production build process.

## User Preferences
None specified yet.

## Notes
- Original project included docker-compose for Postgres, but database is not currently configured in Replit
- RouterOS scripts are included for network device bootstrapping
- OpenAPI documentation is available in docs/openapi.yml
