
# SwissBroker OS - Architectural Overview

## 1. Executive Summary
SwissBroker OS is a multi-tenant, role-based SaaS platform designed for the Swiss insurance and finance brokerage market. It allows brokerages to manage **Private & Corporate Clients**, policies, mortgages, and compliance while providing end-clients with a transparent dashboard.

The architecture emphasizes **Security**, **Multi-tenancy (White Labeling)**, **Role-Based Access Control (RBAC)**, **AI Customization**, and **Advanced HR & Team Operations**.

## 2. Tech Stack

*   **Core Framework:** React 19
*   **Language:** TypeScript 5.x
*   **Build Tool:** Vite (ESM)
*   **Styling:** Tailwind CSS (Utility-first, heavily leveraging CSS Variables for runtime theming)
*   **Routing:** React Router DOM v7
*   **AI Integration:** Google Gemini API (via `@google/genai`) - Supports Text, Vision & Native Audio.
*   **Visualization:** `recharts` (2D) and `@react-three/fiber` (3D)
*   **Icons:** Lucide React

## 3. Directory Structure (Updated)

```text
/
├── components/         # Reusable UI components
│   ├── 3d/             # Three.js scenes (WealthVis, HeroScene)
│   ├── ui/             # Atomic design elements (Button, Card, Modal, SensitiveData)
│   ├── marketing/      # Public facing components (AgentComparison)
│   └── Layout.tsx      # Main application shell
├── contexts/           # Global State Management
│   ├── AuthContext     # User session, RBAC & Impersonation logic
│   ├── BrandingContext # Runtime White-labeling injection
│   ├── LanguageContext # Dynamic L10n management
│   └── SecurityContext # Privacy mode & AI Opt-in state
├── pages/              # Route views
│   ├── team/           # HR & Team Management
│   ├── saas/           # Platform Owner tools (SaaSPlans, SaaSTaxConfig, SaaSEmbeddedFinance)
│   ├── CorporateDetail.tsx # B2B Client View
│   ├── LeadMarketplace.tsx # Lead Exchange System
│   ├── CallAgent.tsx       # AI Voice Agent (Native Audio)
│   └── ...
├── types.ts            # Shared TypeScript Interfaces (User, Team, Policy, Client)
└── constants.ts        # Mock Data & Configuration
```

## 4. Key Architectural Patterns

### 4.1. Hybrid Client Model (Private vs. Corporate)
The system supports two distinct client types within the same `Client` interface via the `type` discriminator (`PRIVATE` | `CORPORATE`).
*   **Private:** Focus on Date of Birth, Pension (3a), and Personal Tax.
*   **Corporate:** Focus on UID, NOGA-Codes, Employee Count, and BVG/Fleet policies.
*   **UI Adaptation:** The `Clients.tsx` list and `ClientDetail` vs `CorporateDetail` views adapt dynamically based on this type.

### 4.2. Embedded Finance & Lead Marketplace
New revenue streams are integrated directly into the core OS:
*   **Lead Marketplace:** A P2P exchange for brokers to buy/sell leads. Transactions modify `LeadOffer` status and trigger simulated wallet updates.
*   **Embedded Finance:** Leasing and Credit calculators (`CreditSimulation.tsx`) connect to mock banking APIs, calculating broker margins and platform fees in real-time.

### 4.3. HR & Sensitive Data Privacy (nDSG)
To comply with the Swiss **nDSG** and labor laws:
*   **Role-Gating:** Salary data, AHV-numbers, and contract details are strictly restricted to `BROKER_ADMIN` and `SAAS_SUPER_ADMIN`.
*   **SensitiveData Component:** Applies a CSS blur filter to sensitive values.
*   **Maintenance Mode:** A global "Kill-Switch" (`SaaSMaintenance.tsx`) allows Super Admins to lock out all non-admin users during updates.

### 4.4. Lead Radar (Search Grounding Engine)
Transforms the CRM from reactive to active using `gemini-3-pro` with `googleSearch`.
*   **Context-aware prompting:** Finds companies (B2B) or individuals (LinkedIn X-Ray) based on the user's role (Hunter vs. Broker).

### 4.5. AI Native Audio
The `CallAgent.tsx` module utilizes Gemini's Native Audio capabilities (`gemini-2.5-flash-native-audio`) for low-latency, interruptible voice conversations, bypassing traditional Speech-to-Text pipelines for higher emotional intelligence.

## 5. Security & Compliance
*   **Data Residency:** 100% Swiss Hosted (Zürich Tier IV).
*   **Encryption:** TLS 1.3 for transit, AES-256 for data at rest.
*   **Isolation:** Logical tenant separation in the data layer.
*   **AI Privacy:** Opt-in per feature. No global training on user-specific financial data.
