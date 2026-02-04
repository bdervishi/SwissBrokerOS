
# End-to-End (E2E) Testing Plan

## 1. Tool Selection
**Playwright** is the primary tool for E2E testing to ensure cross-browser compatibility and handling of multi-step onboarding flows.

## 2. Critical User Journeys (CUJs)

### Scenario A: Broker Lifecycle (General)
*   **Acquisition:** Lead Radar search -> Add to CRM.
*   **Onboarding:** Smart Import Center -> CSV Upload -> AI Mapping check.
*   **Analysis:** Policy Detail -> Smart Summary.

### Scenario B: Corporate Client Management (New)
1.  **Login:** `BROKER_ADMIN`.
2.  **Navigation:** Go to **Klienten**.
3.  **Action:** Click **Neuer Klient** -> Select **Firma**.
4.  **Form:** Enter "Muster AG", UID "CHE-123.456.789".
5.  **Navigation:** Open the new client.
6.  **Verification:** Check if "Risiko-Radar (B2B)" and "Flotten-Manager" tabs are available.

### Scenario C: Lead Marketplace Transaction (New)
1.  **Login:** `BROKER_AGENT`.
2.  **Navigation:** Go to **Lead Exchange**.
3.  **Action:** Select a "Mortgage" lead with Quality Score > 90.
4.  **Buy:** Click **Kaufen** -> Confirm.
5.  **Verification:** Verify "Success Modal" appears and lead details (Name/Phone) are revealed.

### Scenario D: SaaS Maintenance Operations
1.  **Login:** `SAAS_SUPER_ADMIN`.
2.  **Navigation:** Go to **System Wartung**.
3.  **Action:** Enable **Wartungsmodus**.
4.  **Verification:** Open an incognito window, try to access `/login/broker`. Verify redirection to Maintenance Page.
5.  **Recovery:** Disable Wartungsmodus and verify access is restored.

### Scenario E: HR Management & Privacy
1.  **Login:** `BROKER_ADMIN`.
2.  **Navigation:** Go to **Team & HR** -> Employee Profile.
3.  **Privacy Check:** Enable **Privacy Mode**. Verify Salary is blurred.
4.  **HR Access:** Verify visibility of "Personal & Vertrag" tab.
5.  **RBAC Check:** Logout/Login as `BROKER_AGENT`. Verify HR tab is hidden.

## 3. Visual Regression
*   **Corporate vs Private:** Screenshot comparison of `ClientDetail` vs `CorporateDetail` layouts.
*   **Dark Mode:** Check readability of sensitive data (blurred state) in dark mode.
