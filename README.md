# VAAYU — Decentralized & Dynamic Rural Healthcare Discovery & Referral Platform
> **Smart India Hackathon (SIH) Project**  
> *Enabling Resilient, Offline-First Healthcare Access, Live Facility Capacity, and Intelligent Referrals for Rural India.*

---

## Executive Summary & SIH Problem Statement

In rural India, primary healthcare delivery faces critical bottlenecks:
1. **Information Asymmetry**: Rural patients travel hours to Primary Health Centres (PHCs) or Community Health Centres (CHCs) only to find doctors absent, diagnostic equipment broken, or beds full.
2. **Referral Chaos**: Referrals are tracked on paper slips, leading to high dropouts, secondary overcrowding, and emergency delays.
3. **Intermittent Connectivity**: Rural health workers (ASHAs) operate in network shadow zones where standard cloud apps fail completely.

**VAAYU** solves this with a **Decentralized, Resilient Healthcare Discovery & Dynamic Referral Monolith**:
- **Offline-First Patient & ASHA Portal**: Full maternal/antenatal registers and referral generation that work offline with automatic background sync.
- **Live Dynamic Capacity & Freshness Tracking**: Real-time bed and service availability toggles with automated confidence decay.
- **Geospatial Discovery & Routing**: Powered by **MapmyIndia (Mappls)** with a mathematical **Haversine Geo-Engine fallback** (1.4x road tortuosity).
- **Automated SMS & WhatsApp Alerts**: Patient referral confirmation tickets (`REF-XXXX`) and Emergency SOS dispatch via Twilio.
- **All-India Postal Directory**: Direct indexing of ~19,300 PIN codes and 150,000+ post offices via India Post API and Redis caching.

---

## System Architecture

### Draw.io Architecture Diagram
The architecture is available in [`architecture-diagram.drawio`](./architecture-diagram.drawio). You can open and edit this file directly in [diagrams.net](https://app.diagrams.net/) or in VS Code with the Draw.io extension.

### End-to-End Visual Topology (Mermaid)

```mermaid
flowchart TB
  subgraph Stakeholders["Stakeholders"]
    P["Citizen / Patient"]
    ASHA["ASHA Health Worker"]
    STAFF["Facility Staff (PHC/CHC)"]
    ADMIN["District Administrator"]
  end

  subgraph ClientLayer["Client Layer (React 19 + Vite SPA)"]
    HOME["Public Discovery & PIN Directory"]
    ASHA_WS["Offline ASHA Workspace + Outbox"]
    STAFF_WS["Live Bed & Service Capacity Toggles"]
    ADMIN_WS["Real-Time Telemetry & Bottleneck Monitor"]
    SOS_UI["1-Tap Emergency SOS Dispatcher"]
  end

  subgraph Gateway["API Gateway & Security"]
    AUTH["Google OAuth 2.0 & RBAC Middleware"]
    IDEMP["Idempotency Key Verifier (x-idempotency-key)"]
    SYNC_PROC["Batch Offline Sync Processor"]
  end

  subgraph CoreModules["Core Backend Modules (Express + TypeScript)"]
    DISC_MOD["Facility Discovery & Ranking"]
    REF_MOD["Referral Coordinator (REF-XXXX)"]
    SOS_MOD["Emergency SOS & Ambulance Allocator"]
    PIN_MOD["India Post 19,000+ PIN Directory"]
    CAP_MOD["Dynamic Capacity & Freshness Decay"]
    DIAG_MOD["Health & Subsystem Telemetry"]
  end

  subgraph DataLayer["Persistence & Cache"]
    PG[("PostgreSQL 15/18 (vaayu)\n11 Relational Tables")]
    REDIS[("Redis 7 Cache / Memory Engine\n24-hr TTL PIN Directory")]
  end

  subgraph ExternalAdapters["External Integrations & Gateways"]
    MAPPLS["MapmyIndia (Mappls) Distance Matrix\n(OAuth Auto-Renewal)"]
    TWILIO["Twilio SMS & WhatsApp Gateway"]
    ABDM["ABDM / NDHM Gateway (Future/Roadmap)"]
    HAVERSINE["Haversine Road Tortuosity Engine (Fail-Safe)"]
  end

  P --> HOME & SOS_UI
  ASHA --> ASHA_WS & SOS_UI
  STAFF --> STAFF_WS
  ADMIN --> ADMIN_WS

  ClientLayer --> Gateway
  Gateway --> CoreModules
  CoreModules --> DataLayer
  CoreModules --> ExternalAdapters
```

---

## Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI / SPA** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Zustand (Store with IndexedDB/LocalStorage persistence) |
| **Backend REST API** | Node.js 20, Express, TypeScript, Helmet Security, CORS, Idempotency & RBAC Middleware |
| **Database** | PostgreSQL 15/18 (11 relational tables) with automatic database provisioning & `pg-mem` local testing |
| **Cache Layer** | Redis 7 Alpine with automatic Node.js In-Memory fallback |
| **Authentication** | Google OAuth 2.0 (Google Identity Services) + Role-Based Access Control (RBAC) |
| **Geospatial & Routing** | MapmyIndia (Mappls) REST & OAuth Distance Matrix with automatic 24-hr token renewal + Haversine 1.4x Road Tortuosity fallback |
| **Communication Gateway** | Twilio SMS & WhatsApp Business Messaging with console simulation fallback |
| **Postal Directory** | India Post API (`api.postalpincode.in`) caching all 19,000+ PIN codes with local PHC/CHC linkage |
| **Containerization** | Docker, Multi-Stage `Dockerfile`, `docker-compose.yml` (PostgreSQL + Redis + App) |

---

## Role-Based Portals & Core Features

```
               ┌──────────────────────────────────────────────────────────┐
               │                     VAAYU Platform                       │
               └─────────┬──────────────┬──────────────┬──────────────┬───┘
                         │              │              │              │
       ┌─────────────────┴─┐   ┌────────┴────────┐   ┌─┴─────────────┐┌┴───────────────────┐
       │ Citizen / Patient │   │   ASHA Worker   │   │Facility Staff ││District Admin Portal│
       │ • Care Discovery  │   │ • Offline Sync  │   │• Bed Toggles  ││• Bottleneck Heatmaps│
       │ • PIN Directory   │   │ • Patient Regist│   │• Referral Inb.││• Discrepancy Audits │
       │ • Ticket Tracking │   │ • Quick Referral│   │• Admission Log││• Live System Health │
       │ • 1-Tap SOS       │   │ • Checkup Logs  │   │• Realtime Cap.││• Metric Telemetry   │
       └───────────────────┘   └─────────────────┘   └───────────────┘└─────────────────────┘
```

### 1. Citizen & Rural Patient Experience
- **Smart Care Discovery**: Enter a medical need (e.g. `X-Ray`, `Blood Test`, `Maternal Care`) or PIN code to find the highest-ranked nearby facilities.
- **PIN Code & Village Directory**: Look up any 6-digit Indian PIN code to view sub-post offices, tehsils, and linked government facilities.
- **Referral Ticket Tracker**: Track referral status (`CREATED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `READY_FOR_VISIT`) using ticket code `REF-XXXX`.
- **1-Tap Emergency SOS**: Immediately dispatches GPS coordinates to the nearest hospital and alerts emergency contacts with assigned ambulance units.

### 2. ASHA & Community Health Worker Workspace
- **Offline Patient Register**: Add and manage rural families and antenatal patient checkups without internet connectivity.
- **Outbox Auto-Sync**: Actions performed in network dead zones are queued in IndexedDB and automatically synchronized once connectivity is restored.
- **Assisted Referral Generation**: Health workers can create pre-authorized digital referrals for high-risk patients.

### 3. Facility Staff Portal (PHC / CHC / District Hospital)
- **Real-Time Capacity Toggles**: Update status (`AVAILABLE`, `LIMITED`, `UNAVAILABLE`) for ICU beds, doctors, ultrasound, and emergency units.
- **Inbound Referral Management**: Accept or redirect incoming referral tickets with clinical reason logging.

### 4. District Health Administration & Telemetry Dashboard
- **Live Bottleneck Detection**: Pinpoints facilities with high rejection rates or overloaded capacities.
- **Crowdsourced Discrepancy Moderation**: Reviews feedback submitted by citizens when facility data doesn't match on-ground reality.
- **Infrastructure Health Monitor**: Live latency telemetry for PostgreSQL, Redis, MapmyIndia, and Twilio.

---

## Quick Start Guide

### Prerequisites
- **Node.js**: v20+ or v22+
- **PostgreSQL** *(Optional if running Docker or pg-mem)*: v15, v16, or v18
- **Docker & Docker Compose** *(Optional for 1-command deployment)*

---

### Option A: Running with Docker (Recommended)

1. Clone the repository and navigate into the folder:
   ```bash
   git clone https://github.com/nivas4506/Vaayu.git
   cd Vaayu
   ```

2. Build and start all containers (PostgreSQL, Redis, and VAAYU Application):
   ```bash
   docker compose up --build -d
   ```

3. Access the platform:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
   - **Health Telemetry**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

### Option B: Running Locally (Node.js & Vite)

1. **Install Dependencies**:
   ```bash
   npm install
   cd Frontend && npm install && cd ..
   ```

2. **Initialize & Seed PostgreSQL Database**:
   ```bash
   npm run seed
   ```

3. **Start Backend Server (Terminal 1)**:
   ```bash
   npm run dev
   ```
   *Runs on port `3000` with hot-reloading.*

4. **Start Frontend Server (Terminal 2)**:
   ```bash
   npm run dev:frontend
   ```
   *Runs on [http://localhost:5173](http://localhost:5173).*

---

## Environment Variables Configuration (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
USE_PG_MEM=false
DATABASE_URL=postgres://postgres:password@localhost:5432/vaayu

# Redis Cache (Set USE_REDIS=true if local Redis is running)
USE_REDIS=false
REDIS_URL=redis://localhost:6379

# MapmyIndia (Mappls) OAuth & REST Credentials
MAPPLS_ACCESS_TOKEN=your_mappls_access_token_here
MAPPLS_CLIENT_ID=your_mappls_client_id_here
MAPPLS_CLIENT_SECRET=your_mappls_client_secret_here

# Google OAuth 2.0 (Google Identity Services)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Twilio SMS & WhatsApp Business Alerts
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## REST API Reference

| Endpoint | Method | Role / Auth | Description |
|---|---|---|---|
| `/api/v1/health` | `GET` | Public | Comprehensive health & latency telemetry for all subsystems |
| `/api/v1/health/ping/:service` | `GET/POST` | Public | Diagnostic ping test (`database`, `redis`, `mappls`, `twilio`) |
| `/api/v1/facilities` | `GET` | Public | List all active healthcare facilities with service availability |
| `/api/v1/facilities/:id` | `GET` | Public | Detailed facility profile with capacity timestamps |
| `/api/v1/discover` | `GET` | Public | Intelligent discovery & ranking by medical need, PIN, or GPS |
| `/api/v1/pincode/:code` | `GET` | Public | All-India 19,000+ PIN directory with linked government facilities |
| `/api/v1/referrals` | `POST` | ASHA / Staff / Admin | Create new referral ticket (`REF-XXXX`) & trigger SMS/WhatsApp |
| `/api/v1/referrals/:code` | `GET` | Public | Public tracking of referral ticket with timeline events |
| `/api/v1/referrals/:id/status` | `PATCH` | Staff / Admin | Update referral status (`ACCEPTED`, `READY_FOR_VISIT`, etc.) |
| `/api/v1/availability-updates` | `POST` | Staff / Admin | Toggle real-time bed & service capacity |
| `/api/v1/sos/trigger` | `POST` | All Roles | Trigger emergency SOS with GPS coordinates & ambulance allocation |
| `/api/v1/sos/status/:id` | `GET` | Public | Poll active emergency SOS status and ambulance unit |
| `/api/v1/feedback` | `POST` | Public | Submit facility capacity feedback & reported discrepancies |
| `/api/v1/sync` | `POST` | Public / ASHA | Batch offline synchronization for mobile outboxes |
| `/api/v1/admin/metrics` | `GET` | Admin | District-wide referral throughput, bottleneck stats & uptime |
| `/api/v1/admin/issues` | `GET` | Admin | Filtered list of reported data discrepancies & service outages |

---

## Project Structure

```text
SIH/
├── backend/                        # Express + TypeScript Backend
│   ├── src/
│   │   ├── app.ts                  # App configuration, CORS & static SPA router
│   │   ├── server.ts               # Server entrypoint with auto-seeding
│   │   ├── routes.ts               # Master REST API router
│   │   ├── config/env.ts           # Centralized environment validator
│   │   ├── db/
│   │   │   ├── client.ts           # Universal PostgreSQL & pg-mem client
│   │   │   ├── cache.ts            # Redis & in-memory cache engine
│   │   │   ├── schema.sql          # 11 Relational tables DDL
│   │   │   └── seed.ts             # Initial health facilities & taxonomy data
│   │   ├── middleware/             # RBAC, Idempotency & Global Error Handlers
│   │   └── modules/                # Domain Micro-Modules
│   │       ├── admin/              # District analytics & bottleneck detector
│   │       ├── availability/       # Capacity toggles & freshness decay
│   │       ├── discovery/          # MapmyIndia & Haversine routing engine
│   │       ├── facilities/         # PHC/CHC registry & taxonomies
│   │       ├── feedback/           # Citizen feedback & discrepancy moderation
│   │       ├── health/             # Infrastructure diagnostics & telemetry
│   │       ├── notifications/      # Twilio SMS & WhatsApp dispatcher
│   │       ├── pincode/            # All-India Postal PIN code resolver
│   │       ├── referrals/          # Digital referral coordinator (REF-XXXX)
│   │       ├── sos/                # Emergency SOS & ambulance dispatch
│   │       └── sync/               # Batch offline outbox synchronization
├── Frontend/                       # React 19 + Vite Frontend SPA / PWA
│   ├── client/
│   │   ├── index.html              # HTML5 template with Google GSI SDK
│   │   └── src/
│   │       ├── App.tsx             # Root router with smooth transitions
│   │       ├── store.ts            # Zustand global store with offline outbox
│   │       ├── i18n.ts             # Multi-language localization engine
│   │       ├── services/           # apiClient.ts & offline OTP services
│   │       └── components/         # Modular UI Components
│   │           ├── Header.tsx      # Responsive header with role navigation
│   │           ├── Landing.tsx     # Public Homepage with features & network
│   │           ├── AuthFlow.tsx    # Google OAuth 2.0 & Email Auth
│   │           ├── FindCare.tsx    # Facility search & discovery
│   │           ├── PatientDashboard.tsx # Patient care journey
│   │           ├── AshaWorkspace.tsx    # Offline health worker tools
│   │           ├── StaffWorkspace.tsx   # Facility capacity controller
│   │           ├── AdminDashboard.tsx   # District telemetry & bottleneck analytics
│   │           └── EmergencyFlow.tsx    # 1-Tap SOS ambulance dispatch
├── docker/                         # Production Docker Setup
│   ├── Dockerfile                  # Multi-stage build (Frontend + Backend)
│   ├── docker-compose.yml          # Full stack (PostgreSQL + Redis + App)
│   └── .dockerignore               # Optimized Docker context ignore rules
├── architecture-diagram.drawio     # Editable Draw.io XML Architecture Diagram
├── package.json                    # Root scripts & dependencies
└── tsconfig.json                   # Root TypeScript compiler configuration
```

---

## 🇮🇳 Smart India Hackathon (SIH) Alignment

- **Theme**: Healthcare & Biomedical Technology / Smart Automation
- **Target Audience**: 800+ million rural citizens, 1M+ ASHA workers, primary health centers (PHCs/CHCs), and District Medical Officers.
- **Innovation Highlights**:
  1. **Zero-Failure Architecture**: Operates offline without network; works with zero external API dependencies via automatic mathematical fallbacks.
  2. **Multi-Channel Delivery**: Works across Web SPA, Mobile PWA, SMS alerts, and WhatsApp messages.
  3. **ABDM/NDHM Ready**: Built to integrate with India's Ayushman Bharat Health Stack (ABHA IDs, HFR Facility Registry, and FHIR R4 records).

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
