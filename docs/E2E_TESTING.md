# End-to-End (E2E) Testing Plan

## 1. Tool Selection
**Playwright** is chosen for its native support of modern web features, speed, and ability to handle multi-tab scenarios.

## 2. Critical User Journeys (CUJs)

### Scenario A: The "Golden Path" - Broker Lifecycle
1.  **Login:** User logs in as `BROKER_ADMIN`.
2.  **Acquisition:** Navigates to **Lead Radar**. Searches "Architekten Zürich". Adds a result to CRM.
3.  **Onboarding:** Navigates to **Data Import**. Uploads CSV. Verifies AI Mapping. Confirms Import.
4.  **Analysis:** Opens Policy Detail of a new client. Checks "Smart Summary".
5.  **Logout.**

### Scenario B: The SaaS Hunter (Acquisition)
1.  **Login:** User logs in as `SAAS_ACQUISITION`.
2.  **Lead Radar:** Checks that the prompt context is optimized for finding "Insurance Brokers".
3.  **Search:** Searches "Makler Bern".
4.  **Result:** Adds a lead to the internal SaaS pipeline.
5.  **Access Check:** Verifies they CANNOT see tenant financial details (restricted to Finance role).

### Scenario C: The Agent Experience (Sales Force)
1.  **Login:** User logs in as `BROKER_AGENT` (Felix).
2.  **Dashboard:** Verifies `AgentDashboard` (Wallet, KPIs).
3.  **Restriction:** Tries to access `/import` or `/settings`. Expects redirect.
4.  **Commission:** Checks "Offene Provisionen" matches assigned deals.

### Scenario D: AI Studio Configuration
1.  **Login:** `BROKER_ADMIN`.
2.  **AI Studio:** Changes Persona Tone to "CASUAL".
3.  **Knowledge Base:** Uploads dummy PDF. Checks "Processing" -> "Cached" state transition.

### Scenario E: The Client View
1.  **Login:** `CLIENT`.
2.  **Dashboard:** Verifies "My Policies" and 3D Wealth Visualization.
3.  **Restriction:** Tries to access `/leads` or `/team`. Expects redirect/404.

### Scenario F: Smart Inbox & Productivity
1.  **Login:** `BROKER_ADMIN`.
2.  **Inbox:** Selects an email. Clicks "Smart Analysis". Verifies Summary generation.
3.  **Tagging:** Adds a tag "Urgent". Verifies filtering by tag works.

## 3. Visual Regression Testing
*   **White Labeling:** Compare Screenshots of Tenant A (Blue) vs Tenant B (Red).
*   **Dark Mode:** Verify contrast ratios in Lead Radar cards.

## 4. CI/CD Integration
*   **Trigger:** On every Pull Request to `main`.
*   **Process:** Build App -> Serve Preview -> Run Playwright -> Report Results.