
# Testing Strategy

## 1. Overview
Quality Assurance for SwissBroker OS focuses on **Business Logic Integrity**, **Access Control (RBAC)**, **Data Privacy**, and **AI Reliability**.

## 2. Unit Testing Priorities

### 2.1. Financial Logic
*   **Corporate:** Verify BVG premium aggregation based on payroll sum.
*   **Credit/Leasing:** Test monthly rate calculations for both Private Credit and Leasing (residual value logic).
*   **Lead Marketplace:** Ensure lead price calculations include the platform fee correctly.

### 2.2. Privacy Components
*   **SensitiveData Component:** Ensure the blur filter is applied when `isPrivacyMode` is true.
*   **Role-Based Access (RBAC):** Test that `BROKER_AGENT` cannot access `SaaS` routes or `CorporateDetail` HR tabs.

### 2.3. AI Components
*   **Call Agent:** Verify connection state handling (Idle -> Connecting -> Listening -> Speaking).
*   **Search Grounding:** Mock Gemini responses to ensure the `LeadFinder` correctly parses JSON from unstructured search results.

## 3. Integration Testing

### 3.1. Corporate Client Flow
*   **Creation:** Create a new Corporate Client, ensuring UID and Company Name are required.
*   **Policy Assignment:** Assign a Fleet or BVG policy and verify it appears in the Corporate Detail view.

### 3.2. Marketplace Transaction
*   **Sell Flow:** "Sell" a lead from the CRM, verifying it appears in the public marketplace list.
*   **Buy Flow:** "Buy" a lead and verify the wallet balance decreases and the lead moves to the buyer's pipeline.

## 4. Security & Compliance Testing
*   **Maintenance Mode:** Verify that enabling maintenance mode immediately redirects non-admin users to the maintenance view.
*   **Impersonation:** Verify that a SaaS Admin impersonating a Broker cannot see Super-Admin specific routes.

## 5. Performance
*   **3D Rendering:** Monitor memory usage when switching between multiple `ClientDetail` profiles with active `WealthVis`.
*   **Audio Streaming:** Measure latency in `CallAgent` to ensure it stays below 500ms for a natural conversation feel.
