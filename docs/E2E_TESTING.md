# End-to-End (E2E) Testing Plan

## 1. Tool Selection
**Playwright** is the primary tool for E2E testing to ensure cross-browser compatibility and handling of multi-step onboarding flows.

## 2. Critical User Journeys (CUJs)

### Scenario G: HR Management & Privacy (New)
1.  **Login:** `BROKER_ADMIN`.
2.  **Navigation:** Go to **Team & HR**.
3.  **Selection:** Open the profile of "Felix Fieldagent".
4.  **Privacy Check:** Enable **Privacy Mode** in sidebar.
5.  **Verification:** Verify that Felix's salary is blurred.
6.  **HR Access:** Click the **Personal & Vertrag** tab.
7.  **Data Check:** Verify visibility of AHV-Number and Contract documents.
8.  **RBAC Check:** Logout and login as `BROKER_AGENT`. Verify the HR tab is no longer visible.

### Scenario H: Organization Building (New)
1.  **Login:** `BROKER_ADMIN`.
2.  **Navigation:** Go to **Team & HR**.
3.  **Action:** Click **Neues Team**.
4.  **Form:** Enter "Hypotheken-Zentrum" and a description.
5.  **Navigation:** Click **Team verwalten** for the new team.
6.  **Assignment:** Open the **Mitglieder hinzufügen** modal.
7.  **Search:** Search for a specific employee not in a team.
8.  **Confirmation:** Add them to the team and verify their presence in the team list.

### Scenario I: SaaS Internal Operations (New)
1.  **Login:** `SAAS_SUPER_ADMIN`.
2.  **Navigation:** Go to **SaaS Teams**.
3.  **Org View:** Verify visibility of internal departments (Dev, Sales, Finance).
4.  **Member Detail:** Click on an internal employee and verify their detail page opens correctly.

### Scenario A: Broker Lifecycle (Existing)
*   **Acquisition:** Lead Radar search -> Add to CRM.
*   **Onboarding:** Smart Import Center -> CSV Upload -> AI Mapping check.
*   **Analysis:** Policy Detail -> Smart Summary.

## 3. Visual Regression
*   **Masking State:** Screenshot comparison of Employee profiles with and without Privacy Mode.
*   **Team Layout:** Verify that the "stacked avatar" view in `TeamOverview` displays correctly on mobile.

## 4. Environmental Testing
*   **Dark Mode:** Check readability of sensitive data (blurred state) in dark mode.
*   **Tenant Theming:** Ensure that custom brand colors correctly theme the "Progress Bars" in the Team Detail view.