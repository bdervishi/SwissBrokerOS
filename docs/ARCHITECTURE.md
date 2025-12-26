# SwissBroker OS - Architectural Overview

## 1. Executive Summary
SwissBroker OS is a multi-tenant, role-based SaaS platform designed for the Swiss insurance and finance brokerage market. It allows brokerages to manage clients, policies, mortgages, and compliance while providing end-clients with a transparent dashboard.

The architecture emphasizes **Security**, **Multi-tenancy (White Labeling)**, **Role-Based Access Control (RBAC)**, **AI Customization**, and **Module-Based Employee Permissions**.

## 2. Tech Stack

*   **Core Framework:** React 18
*   **Language:** TypeScript 5.x (Strict Mode)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (Utility-first, heavily leveraging CSS Variables for theming)
*   **Routing:** React Router DOM v6
*   **AI Integration:** Google Gemini API (via `@google/genai`) for:
    *   **Text Analysis:** Summarization, Sentiment, Checklists.
    *   **Grounding:** Live Google Search for Lead Generation.
    *   **Data Mapping:** AI-assisted CSV column matching.
*   **Visualization:** 
    *   `recharts` for 2D Analytics (Commissions, Tax scenarios)
    *   `@react-three/fiber` / `three.js` for 3D Wealth Visualization
*   **Icons:** Lucide React

## 3. Directory Structure

```text
/
├── components/         # Reusable UI components
│   ├── 3d/             # Three.js scenes (WealthVis, HeroScene)
│   ├── ui/             # Atomic design elements (Button, Card, Modal)
│   └── Layout.tsx      # Main application shell (Sidebar, Header)
├── contexts/           # Global State Management (The "Brain")
│   ├── AuthContext     # User session & Impersonation logic
│   ├── BrandingContext # White-labeling & Theme injection
│   ├── LanguageContext # i18n logic & Dynamic Translation Management
│   └── SecurityContext # Privacy mode & AI Opt-in state
├── pages/              # Route views (Lazy loaded in production)
│   ├── LeadFinder.tsx    # AI Lead Radar (Search Grounding)
│   ├── DataImport.tsx    # AI CSV Import Mapper
│   ├── TaxManagement.tsx # Tax Dashboard & Relocation Simulator
│   ├── BrokerAIConfig.tsx# Broker AI Studio (Personas & Knowledge Base)
│   ├── AgentDashboard.tsx# Dedicated Sales Force View
│   ├── SaaSTaxConfig.tsx # Global Tax Engine Configuration (SaaS Admin)
│   ├── TeamOverview.tsx  # HR & Employee Management
│   ├── Inbox.tsx         # AI-Enhanced Email Client
│   └── ...
├── types.ts            # Shared TypeScript Interfaces (User, EmployeeModule, Email)
└── constants.ts        # Mock Data & Configuration Constants
```

## 4. Key Architectural Patterns

### 4.1. Lead Radar (Search Grounding Engine)
A dedicated module (`LeadFinder.tsx`) that transforms the CRM from reactive to active.
*   **Mechanism:** Uses `gemini-3-pro` with the `googleSearch` tool enabled.
*   **Context Awareness:** 
    *   If Role = `BROKER`: Searches for potential end-clients (e.g., "Dentists in Zurich").
    *   If Role = `SAAS_ACQUISITION`: Searches for Brokerage Firms to sell the SaaS to.
*   **Data Enrichment:** Extracts unstructured web results into structured JSON candidates for the CRM pipeline.

### 4.2. Smart Import Center (AI Mapping)
To solve the onboarding friction of migrating legacy data:
1.  **Upload:** User uploads a raw CSV.
2.  **AI Analysis:** Gemini analyzes the CSV headers (e.g., "Prämie p.a.") and fuzzy-matches them to the internal Prisma Schema (`premiumAmount`).
3.  **Validation:** User reviews the AI's mapping proposal before ingestion.

### 4.3. Multi-Tenancy & White Labeling
Unlike traditional apps that load static CSS, SwissBroker OS uses a **Runtime Injection Strategy**.
1.  **Context Layer:** `BrandingContext.tsx` identifies the user's `tenantId`.
2.  **Injection:** Calculates a full color palette (50-900 shades) from a single Hex code and injects them into `:root` CSS variables.

### 4.4. Broker AI Studio (Custom AI Models)
We enable brokers to configure their own "Corporate Brain".
*   **Persona Configuration:** Brokers define `systemInstructions` (Tone, Forbidden Words).
*   **Knowledge Base (RAG):** Uploaded PDFs use **Gemini Context Caching** to store tokens efficiently, referencing cached context IDs for subsequent calls.

### 4.5. Role-Based Access Control (RBAC)
Security is handled at multiple levels:
*   **UserRole Enum:** `BROKER_ADMIN`, `BROKER_AGENT`, `CLIENT`, `SAAS_ADMIN`, `SAAS_ACQUISITION`.
*   **Agent Portal:** A gamified dashboard (`AgentDashboard.tsx`) for external agents, hiding sensitive admin data.
*   **Employee Modules:** Granular permission system (`EmployeeModule[]`) for internal staff ('INSURANCE', 'TAX', 'MORTGAGE').

### 4.6. Financial Engine (Storno Radar)
*   **Clawback Logic:** Client-side calculation of "Risk Amount" based on liability periods.
*   **Algorithm:** `Risk = Commission * ((LiabilityMonths - MonthsPassed) / LiabilityMonths)`.

## 5. Data Flow
Currently, the application uses a **Client-Side Mock Data Layer** (`constants.ts`).
*   **Read:** Components import mock arrays and filter by `tenantId` or `userId`.
*   **Write:** State is handled locally within components or Contexts.
*   **AI Integration:** Direct calls to Google GenAI SDK.

## 6. Scalability Considerations
*   **Context Caching:** Essential for the "Broker AI" feature to remain cost-effective.
*   **Search Quotas:** The Lead Radar relies on Google Search grounding, which has rate limits that need to be managed in a production backend proxy.