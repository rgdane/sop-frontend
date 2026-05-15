# SOP Benchmark Platform

A full-stack benchmarking platform for comparing PostgreSQL vs Neo4j performance in SOP/workflow management systems. Built with Next.js 16, Go backend, and Docker.

## Overview

This project investigates the performance characteristics of relational (PostgreSQL) vs graph (Neo4j) databases for Standard Operating Procedure (SOP) and workflow management. The platform provides a real-time benchmarking dashboard that executes load tests against both database backends and visualizes latency comparisons across different query complexity scenarios.

The motivation stems from real-world workflow systems where SOPs, SPKs (work orders), and job sequences involve complex relationships and traversals. While relational databases handle structured data well, graph databases excel at traversing interconnected workflows. This platform provides empirical data to guide database selection decisions.

## Key Features

### Benchmark Dashboard
- Real-time latency comparison between SQL and Graph databases
- Three benchmark scenarios with increasing complexity:
  - **Divisions** (Simple): Single-table operations, minimal relationships
  - **SOPs** (Medium): Multi-table joins with division associations
  - **SOP Jobs** (Complex): Linked-list traversal patterns with workflow dependencies
- Visual charts using Recharts with interactive tooltips
- Database seeder control panel for populating test data

### Dual Database Architecture
- Identical REST API surface for both SQL and Graph backends
- SQL endpoints: `/divisions/sql`, `/sops/sql`, `/sop-jobs/sql`
- Graph endpoints: `/divisions/graph`, `/sops/graph`, `/sop-jobs/graph`
- Load testing using Vegeta (Go-based HTTP load generator)

### Workflow Management
- SOP (Standard Operating Procedure) CRUD operations
- SPK (Surat Perintah Kerja / Work Order) management
- Linked-list job sequencing with position assignments
- Flowchart visualization using Mermaid.js
- Division and Title management with relational associations

### Technical Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **State Management**: Redux Toolkit, React Query
- **UI Components**: Ant Design 5, Tailwind CSS 4
- **Visualization**: Recharts, Mermaid.js, React Flow
- **Database Clients**: axios with interceptors for auth
- **Containerization**: Docker, Google Cloud Run
- **CI/CD**: Google Cloud Build

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Next.js Frontend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │   Dashboard │  │  Benchmark  │  │   SOP/SPK   │  │  Flowchart │  │
│  │    Page     │  │   Panel     │  │   Pages     │  │  Render    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Go Backend (Fiber)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  REST API   │  │   Vegeta    │  │   Seeder    │  │  Graph DB  │  │
│  │   Routes    │  │   Runner    │  │   Service   │  │   Client   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
            │                         │
            ▼                         ▼
┌─────────────────────┐    ┌─────────────────────┐
│   PostgreSQL (SQL)  │    │     Neo4j (Graph)   │
│  - Divisions        │    │  - Node: Division   │
│  - Titles           │    │  - Node: SOP        │
│  - SOPs             │    │  - Node: SopJob     │
│  - SPKs             │    │  - REL: HAS_NEXT    │
│  - SOPJobs          │    │  - REL: BELONGS_TO  │
└─────────────────────┘    └─────────────────────┘
```

## Database Design

### PostgreSQL Schema (Relational)
- **divisions**: id, code, name, created_at, updated_at, deleted_at
- **titles**: id, name, created_at, updated_at, deleted_at
- **sops**: id, code, name, description, division_id, created_at, updated_at, deleted_at
- **spks**: id, code, name, description, created_at, updated_at, deleted_at
- **sop_jobs**: id, name, alias, type, position_id, sop_id, reference_id, index, step, output
- Foreign key relationships for referential integrity
- Soft deletes with deleted_at timestamp

### Neo4j Graph Model
- **Nodes**: Division, Title, Sop, Spk, SopJob, SpkJob
- **Relationships**:
  - `(sop:Sop)-[:BELONGS_TO]->(division:Division)`
  - `(job:SopJob)-[:HAS_SOP]->(sop:Sop)` (linked-list pattern)
  - `(sop:Sop)-[:HAS_JOB]->(job:SopJob)`

### Benchmark Scenarios

| Scenario | Complexity | Query Pattern |
|----------|------------|---------------|
| Divisions | Simple | Single table SELECT with pagination |
| SOPs | Medium | JOIN between SOPs and Divisions |
| SOP Jobs | Complex | Recursive linked-list traversal with position lookup |

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Ant Design 5 |
| **State** | Redux Toolkit, React Query (TanStack) |
| **Charts** | Recharts, Mermaid.js, React Flow |
| **Backend** | Go (Fiber framework) |
| **Databases** | PostgreSQL, Neo4j |
| **Load Testing** | Vegeta |
| **Container** | Docker |
| **Cloud** | Google Cloud Run, Cloud Build |

## API Endpoints

### Benchmark API
```
GET /benchmark/{scenario}/sql     - Run SQL benchmark (divisions|sops|sop-jobs)
GET /benchmark/{scenario}/graph    - Run Graph benchmark (divisions|sops|sop-jobs)
```

### Seeder API
```
POST /seeders/master-data  - Seed Divisions and Titles
POST /seeders/parent-data  - Seed SOPs and SPKs
POST /seeders/job-data     - Seed SOP Jobs and SPK Jobs
```

### Division API (Dual Backend)
```
GET    /divisions/sql      - List divisions from PostgreSQL
GET    /divisions/graph    - List divisions from Neo4j
POST   /divisions/sql      - Create division (SQL)
POST   /divisions/graph    - Create division (Graph)
PUT    /divisions/sql/:id  - Update division (SQL)
DELETE /divisions/sql/:id  - Delete division (SQL)
```

### SOP Management
```
GET    /sops               - List SOPs with pagination
POST   /sops               - Create SOP
GET    /sops/:id           - Get SOP details
PUT    /sops/:id           - Update SOP
DELETE /sops/:id           - Soft delete SOP
```

### SOP Jobs (Workflow)
```
GET    /sop-jobs           - List jobs for SOP
POST   /sop-jobs           - Create job step
PUT    /sop-jobs/:id       - Update job step
```

## Screenshots

![Dashboard Benchmark](./docs/dashboard-benchmark.png)

*Benchmark dashboard showing latency comparison between PostgreSQL and Neo4j*

![Flowchart Visualization](./docs/flowchart.png)

*SOP workflow visualization using Mermaid diagrams*

## Running the Project

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- Go 1.21+ (for backend)
- PostgreSQL 15+
- Neo4j 5.x

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/sop-frontend.git
cd sop-frontend

# Copy environment template
cp src/.env.example .env
```

Configure your `.env` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
IMAGE_NAME=sop-frontend-img
CONTAINER_NAME=sop-frontend-container
PORT=3000
```

### Docker Development

```bash
# Build the Docker image
make build

# Run the container
make run

# View logs
make logs

# Stop container
make stop

# Full rebuild
make fresh
```

### Local Development

```bash
cd src
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`

### Backend Setup

The backend is a separate Go service. Clone and run:

```bash
git clone https://github.com/rgdane/sop-backend.git
cd sop-backend

# Copy environment
cp .env.example .env

# Configure database connections
# POSTGRES_HOST=localhost:5432
# NEO4J_HOST=localhost:7687

# Run the server
go run main.go
```

The API runs on `http://localhost:8080`

### Database Initialization

Use the frontendSeeder Control Panel to populate test data:

1. Navigate to Dashboard
2. Select "Semua Data (Berurutan)" from dropdown
3. Click "Jalankan Seeder"
4. Wait for all three phases: Master → Parent → Job

## Benchmark Workflow

### Running a Benchmark

1. Navigate to Dashboard page
2. Select benchmark scenario from dropdown:
   - Skenario Sederhana (Divisions)
   - Skenario Menengah (SOP)
   - Skenario Kompleks (SOP Jobs)
3. Click "Mulai Benchmark"
4. View results in the latency comparison chart

### Interpreting Results

- **Database Latency**: Raw query execution time in the database
- **Backend Latency**: Full HTTP request/response cycle including network overhead
- **P99 Latency**: 99th percentile response time (tail latency)
- **Success Rate**: Percentage of successful requests

## Project Status

This is an active research and development project investigating database performance for workflow management systems. The platform is being used to collect empirical benchmark data for thesis research.

### Current Capabilities
- Real-time SQL vs Graph latency comparison
- Automated load testing with configurable rates
- Visual dashboard with interactive charts
- Full CRUD operations for SOP/SPK management
- Mermaid-based workflow visualization

### In Development
- Extended traversal scenario benchmarking
- Real case dataset implementation

## Repository Structure

```
sop-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/
│   │   │   ├── data-pegawai/   # Employee data (Divisions, Titles)
│   │   │   ├── master/         # SOP/SPK management
│   │   │   └── profile/        # User profile
│   │   └── page.tsx            # Landing page
│   │
│   ├── components/
│   │   ├── fragments/         # Reusable component groups (Flowchart)
│   │   ├── layout/            # Layout components
│   │   ├── providers/         # Context providers (Auth, Toast, Theme)
│   │   └── ui/                # Base UI components (Button, Table, Modal)
│   │
│   ├── features/
│   │   ├── dashboard/         # Benchmark dashboard & seeder
│   │   ├── division/          # Division management (SQL/Graph)
│   │   ├── sop/               # SOP CRUD & visualization
│   │   ├── sop-job/           # Workflow job sequencing
│   │   ├── spk/               # Work order management
│   │   ├── spk-job/           # SPK job workflows
│   │   ├── title/             # Position/Title management
│   │   └── user/              # User management
│   │
│   ├── config/                # Axios configuration, CRUD factory
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities (date formatting, diagram helpers)
│   ├── navigation/            # Menu configuration
│   ├── store/                 # Redux store configuration
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions
│
├── public/                    # Static assets (icons, images)
├── Dockerfile                 # Multi-stage Docker build
├── cloudbuild_prod.yaml      # GCP Cloud Build config
├── makefile                  # Docker management commands
└── package.json               # Frontend dependencies
```

## Engineering Highlights

### Dual-Database API Design
The platform implements a clean API pattern where identical operations are available against both PostgreSQL and Neo4j, enabling direct performance comparison under identical workloads.

### Benchmark Automation
The Go backend integrates Vegeta for HTTP load generation, executing precise 10-second test windows at 500 requests/second against both database backends, ensuring statistically comparable results.

### Workflow Visualization
The Mermaid.js integration dynamically renders SOP job sequences as flowcharts, providing visual verification of linked-list data structures stored in both relational and graph formats.

### Docker Multi-Stage Build
Production Docker build uses a two-stage approach (builder + runner) to minimize image size, with environment-specific build arguments for dev/prod configuration.

### State Management
Redux Toolkit handles global state while React Query manages server state, providing a clean separation between UI state and server synchronization.

---

**Note**: This project requires a companion Go backend service. The frontend expects API endpoints at `NEXT_PUBLIC_API_URL` for database operations and benchmark execution.