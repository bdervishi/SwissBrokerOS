# SwissBroker OS - Architectural Overview

## 1. Executive Summary
SwissBroker OS is a multi-tenant, role-based SaaS platform designed for the Swiss insurance and finance brokerage market. It allows brokerages to manage clients, policies, mortgages, and compliance while providing end-clients with a transparent dashboard.

The architecture emphasizes **Security**, **Multi-tenancy (White Labeling)**, **Role-Based Access Control (RBAC)**, **AI Customization**, and **Advanced HR & Team Operations**.

## 2. Tech Stack

*   **Core Framework:** React 19
*   **Language:** TypeScript 5.x
*   **Build Tool:** Vite (ESM)
*   **Styling:** Tailwind CSS (Utility-first, heavily leveraging CSS Variables for runtime theming)
*   **Routing:** React Router DOM v7
*   **AI Integration:** Google Gemini API (via `@google/genai`)
*   **Visualization:** `recharts` (2D) and `@react-three/fiber` (3D)
*   **Icons:** Lucide React

## 3. Directory Structure (Updated)

```text
/
├── components/         # Reusable UI components
│   ├── 3d/             # Three.js scenes (WealthVis, HeroScene)
│   ├── ui/             # Atomic design elements (Button, Card, Modal, SensitiveData)
│   └── Layout.tsx      # Main application shell
├── contexts/           # Global State Management
│   ├── AuthContext     # User session, RBAC & Impersonation logic
│   ├── BrandingContext # Runtime White-labeling injection
│   ├── LanguageContext # Dynamic L10n management
│   └── SecurityContext # Privacy mode & AI Opt-in state
├── pages/              # Route views
│   ├── team/           # HR & Team Management
│   │   ├── TeamOverview.tsx # Organization hierarchy
│   │   ├── TeamDetail.tsx   # Granular team/member management
│   │   └── EmployeeDetail.tsx # Full HR profile (Salary, Contracts, Personal)
│   ├── saas/           # Platform Owner tools
│   │   ├── SaaSTeams.tsx    # Internal SaaS org management
│   │   └── ...
│   └── ...
├── types.ts            # Shared TypeScript Interfaces (User, Team, Policy)
└── constants.ts        # Mock Data & Configuration
```

## 4. Key Architectural Patterns

### 4.1. Hierarchical Team Management
A dual-layer team system allows both the SaaS provider and individual Broker firms to manage their own internal structures.
*   **SaaS Layer:** Internal departments (Dev, Sales, Support) for platform operations.
*   **Broker Layer:** Dynamic department creation (e.g., "Vorsorge", "Backoffice") with dedicated Team Leaders and shared access scopes.

### 4.2. HR & Sensitive Data Privacy
To comply with the Swiss **nDSG** and labor laws, a specific privacy layer was implemented:
*   **Role-Gating:** Salary data, AHV-numbers, and contract details are strictly restricted to `BROKER_ADMIN` and `SAAS_SUPER_ADMIN`.
*   **SensitiveData Component:** A specialized UI wrapper that applies a CSS blur filter to sensitive values. These can only be revealed via hover (if allowed) or by disabling "Privacy Mode" in settings.
*   **Contract Management:** Linking binary documents (PDFs) to employee profiles for centralized HR file management.

### 4.3. Lead Radar (Search Grounding Engine)
Transforms the CRM from reactive to active using `gemini-3-pro` with `googleSearch`.
*   Context-aware prompting based on the user's role (Finding end-clients vs. finding broker partners).

### 4.4. Multi-Tenancy & White Labeling
Uses a **Runtime Injection Strategy** via `BrandingContext.tsx`. It calculates a full color palette (50-900 shades) from a single Hex code and injects them into CSS variables at the root level.

## 5. Security & Compliance
*   **Data Residency:** 100% Swiss Hosted (Zürich Tier IV).
*   **Encryption:** TLS 1.3 for transit, AES-256 for data at rest.
*   **Isolation:** Logical tenant separation in the data layer.
*   **AI Privacy:** Opt-in per feature. No global training on user-specific financial data.