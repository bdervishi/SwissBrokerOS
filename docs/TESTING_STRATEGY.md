# Testing Strategy

## 1. Overview
Quality Assurance for SwissBroker OS focuses on **Business Logic Integrity** (Mortgage calculations, Tax logic), **Access Control** (RBAC + Modules), **AI Reliability** (Grounding & Mapping), and **Localization**.

## 2. Recommended Toolchain
*   **Test Runner:** Vitest (Native Vite support, fast)
*   **DOM Testing:** React Testing Library (RTL)
*   **Mocking:** Vi (Built-in Vitest mocks)

## 3. Unit Testing Priorities

### 3.1. Business Logic
*   **Mortgage Calculator:** Verify LTV and Affordability thresholds (Swiss Standards).
*   **Import Logic:** Verify that the CSV parser correctly handles different delimiters and encodings.
*   **Storno Risk:** Verify the linear depreciation of liability over time.

### 3.2. Context Logic
*   **AuthContext:** Test role switching and impersonation.
*   **LanguageContext:** Test fallback mechanisms.

## 4. Integration Testing (Component Testing)

### 4.1. Lead Radar (AI Grounding)
*   **Mocking:** Since `googleSearch` is an external tool, tests must mock the *response structure* from Gemini, not the search itself.
    ```typescript
    // Mock Response for Lead Radar
    const mockSearchResponse = {
      candidates: [{
        content: { parts: [{ text: JSON.stringify([{ name: "Test Firm", city: "Zurich" }]) }] }
      }]
    };
    ```
*   **Role Behavior:** Verify that `SAAS_ACQUISITION` role sees the "Broker Search" prompt logic, while `BROKER_ADMIN` sees "Client Search".

### 4.2. Data Import Center
*   **Mapping:** Test the UI logic when AI returns a mapping (e.g., ensure the Select dropdowns pre-fill correctly).
*   **Validation:** Ensure rows with missing "Required" fields are flagged in the review step.

### 4.3. RBAC & Module Rendering
*   **Agent View:** Verify `BROKER_AGENT` cannot access `/settings`.
*   **Employee Modules:** Verify employees without `TAX` module cannot see the Tax Kanban.

## 5. Mocking Strategy (AI & External APIs)

### Global Gemini Mock
Tests must mock the SDK to avoid real API costs and non-deterministic results.

```typescript
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({ 
        text: "Mocked AI Response" 
      })
    }
  }))
}));
```

### File Upload Mock
For `DataImport.tsx` and `BrokerAIConfig.tsx`:
*   Mock `FileReader` to simulate CSV/PDF reading without a real file system.

## 6. Performance Testing
*   **3D WealthVis:** Ensure `Canvas` unmounts cleanly.
*   **Lead Radar:** Verify state handling when switching rapidly between search queries (race conditions).