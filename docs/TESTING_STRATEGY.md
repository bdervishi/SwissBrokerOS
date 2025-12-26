# Testing Strategy

## 1. Overview
Quality Assurance for SwissBroker OS focuses on **Business Logic Integrity**, **Access Control (RBAC)**, **Data Privacy**, and **AI Reliability**.

## 2. Unit Testing Priorities

### 2.1. HR & Financial Logic
*   **Salary Calculation:** Verify that monthly vs. yearly projections handle 13th-month salaries correctly (mocked).
*   **Clawback (Storno) Algorithm:** Verify linear depreciation of commission liability over 36/60 months.
*   **Mortgage Affordability:** Test the 5% imputed interest rule against various income levels.

### 2.2. Privacy Components
*   **SensitiveData Component:** Ensure the blur filter is applied when `isPrivacyMode` is true.
*   **Role-Based Access (RBAC):** Test that `BROKER_AGENT` or `CLIENT` roles are rejected when attempting to access the `HR` tab in `EmployeeDetail.tsx`.

### 2.3. Team Logic
*   **Member Assignment:** Verify that moving an employee from one team to another updates their `teamId` correctly.
*   **Leadership Logic:** Ensure a team can only have one designated leader at a time.

## 3. Integration Testing

### 3.1. Team Management Flow
*   **Create -> Assign -> Manage:** Test the full flow of creating a new broker department, searching for available employees, and assigning them to that department.

### 3.2. AI Grounding & Grounding Extraction
*   **Lead Radar:** Mock Gemini's `googleSearch` results to verify the UI handles structured JSON extraction correctly across different search contexts (Broker vs. SaaS Hunter).

## 4. Security & Compliance Testing
*   **Snapshot Masking:** Periodically check that sensitive fields (Salary, AHV) are never rendered in plain text for unauthorized roles.
*   **Impersonation Boundaries:** Verify that a SaaS Admin impersonating a Broker Admin can see HR data, but an Admin impersonating a Client cannot.

## 5. Performance
*   **3D Rendering:** Monitor memory usage when switching between multiple `ClientDetail` profiles with active `WealthVis` components.
*   **Large Team Lists:** Ensure the `TeamOverview` remains responsive when rendering firms with >50 employees.