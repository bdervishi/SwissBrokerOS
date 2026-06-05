import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  Sliders, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Check,
  ChevronRight,
  Building2,
  Network,
  RotateCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface Client {
  id: string;
  tenant_id: string;
  advisor_id: string;
  advisor_name: string;
  type: 'PRIVATE' | 'CORPORATE';
  status: 'ACTIVE' | 'INACTIVE' | 'ONBOARDING';
  company_name?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  zip_city: string;
  country: string;
  uid_number?: string | null;
  noga_code?: string | null;
  employee_count?: number | null;
  total_payroll_sum?: number | null;
  birth_date?: string | null;
  tax_domicile: string; // canton code or name
  marital_status: string; // LEDIG, VERHEIRATET, GESCHIEDEN, etc.
  trust_score: number;
}

interface Policy {
  id: string;
  client_id: string;
  insurer: string;
  type: string;
  policy_number: string;
  premium_amount: number;
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED';
  coverage_details: string[];
}

interface IntegrationProvider {
  code: string;
  name: string;
  category: 'accounting' | 'erp' | 'productivity' | 'insurance';
  logo_url?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  description: string;
  required_credentials: { key: string; label: string; placeholder: string; is_secret: boolean }[];
  endpoints: { label: string; url: string }[];
}

interface SyncLog {
  id: string;
  provider: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  records: number;
  message: string;
  time: string;
}

// ==========================================
// INITIAL SEED DATA
// ==========================================
const INITIAL_ADVISORS = [
  { id: 'e4be0bb1-872f-410a-8dd3-62d04a600101', name: 'Max Muster (Senior Advisor)' },
  { id: 'a2d88734-72b1-4770-98fc-eb8283300202', name: 'Felix Fieldagent (Junior Advisor)' }
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1c1c1c1-1111-4444-b111-74f00998df01',
    tenant_id: 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1',
    advisor_id: 'e4be0bb1-872f-410a-8dd3-62d04a600101',
    advisor_name: 'Max Muster (Senior Advisor)',
    type: 'CORPORATE',
    status: 'ACTIVE',
    company_name: 'Meier Consulting AG',
    first_name: 'Hans',
    last_name: 'Meier',
    email: 'hans.meier@example.com',
    phone: '+41 79 123 45 67',
    address: 'Bahnhofstrasse 1',
    zip_city: '8001 Zürich',
    country: 'Schweiz',
    uid_number: 'CHE-123.456.789',
    noga_code: '70.22',
    employee_count: 8,
    total_payroll_sum: 940000,
    birth_date: '1980-04-15',
    tax_domicile: 'ZH',
    marital_status: 'VERHEIRATET',
    trust_score: 95
  },
  {
    id: 'c2c2c2c2-2222-4444-b222-74f00998df02',
    tenant_id: 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1',
    advisor_id: 'e4be0bb1-872f-410a-8dd3-62d04a600101',
    advisor_name: 'Max Muster (Senior Advisor)',
    type: 'PRIVATE',
    status: 'ACTIVE',
    company_name: null,
    first_name: 'Anna',
    last_name: 'Schmidt',
    email: 'anna.schmidt@example.com',
    phone: '+41 78 987 65 43',
    address: 'Seestrasse 45',
    zip_city: '8800 Thalwil',
    country: 'Schweiz',
    uid_number: null,
    noga_code: null,
    employee_count: null,
    total_payroll_sum: null,
    birth_date: '1985-11-22',
    tax_domicile: 'ZH',
    marital_status: 'LEDIG',
    trust_score: 82
  },
  {
    id: 'c3c3c3c3-3333-4444-b333-74f00998df03',
    tenant_id: 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1',
    advisor_id: 'a2d88734-72b1-4770-98fc-eb8283300202',
    advisor_name: 'Felix Fieldagent (Junior Advisor)',
    type: 'PRIVATE',
    status: 'ONBOARDING',
    company_name: null,
    first_name: 'Peter',
    last_name: 'Müller',
    email: 'peter.mueller@example.com',
    phone: '+41 76 543 21 09',
    address: 'Dorfplatz 3',
    zip_city: '3000 Bern',
    country: 'Schweiz',
    uid_number: null,
    noga_code: null,
    employee_count: null,
    total_payroll_sum: null,
    birth_date: '1975-07-03',
    tax_domicile: 'BE',
    marital_status: 'GESCHIEDEN',
    trust_score: 74
  }
];

const INITIAL_POLICIES: Policy[] = [
  {
    id: 'p1',
    client_id: 'c1c1c1c1-1111-4444-b111-74f00998df01',
    insurer: 'AXA',
    type: 'Betriebshaftpflicht',
    policy_number: 'CHE-BP-8.223.442',
    premium_amount: 1450,
    status: 'ACTIVE',
    coverage_details: ['Personenschäden', 'Sachschäden', 'Mieterschäden']
  },
  {
    id: 'p2',
    client_id: 'c1c1c1c1-1111-4444-b111-74f00998df01',
    insurer: 'Zurich',
    type: 'Sachversicherung',
    policy_number: 'CHE-S-9.944.112',
    premium_amount: 880,
    status: 'ACTIVE',
    coverage_details: ['Feuer', 'Elementarschäden', 'Einbruchdiebstahl']
  },
  {
    id: 'p3',
    client_id: 'c2c2c2c2-2222-4444-b222-74f00998df02',
    insurer: 'Allianz',
    type: 'Hausrat & Privathaftpflicht',
    policy_number: 'P-123-456-789',
    premium_amount: 420,
    status: 'ACTIVE',
    coverage_details: ['Hausrat All Risks', 'Gebrauchsgegenstände', 'Grobfahrlässigkeitsschutz']
  }
];

const INITIAL_PROVIDERS: IntegrationProvider[] = [
  {
    code: 'bexio',
    name: 'Bexio',
    category: 'accounting',
    status: 'CONNECTED',
    description: 'Bexio synchronisiert Kundenkontakte und Finanztransaktionen direkt mit deiner Buchhaltung.',
    required_credentials: [
      { key: 'client_id', label: 'OAuth Client ID', placeholder: 'z.B. bx_client_748f2...', is_secret: false },
      { key: 'client_secret', label: 'OAuth Client Secret', placeholder: '••••••••••••••••', is_secret: true },
      { key: 'redirect_uri', label: 'Redirect Callback URI', placeholder: 'https://swissbroker.os/api/auth/bexio/callback', is_secret: false }
    ],
    endpoints: [
      { label: 'Kontaktabgleich API', url: 'https://api.bexio.com/2.0/contact' },
      { label: 'Finanzrechnungen API', url: 'https://api.bexio.com/2.0/kb_invoice' }
    ]
  },
  {
    code: 'abacus',
    name: 'Abacus ERP',
    category: 'erp',
    status: 'DISCONNECTED',
    description: 'Direkte AbaConnect-Schnittstelle zum automatisierten Abgleich kantonaler HR- & Lohnsteuerdaten.',
    required_credentials: [
      { key: 'subdomain', label: 'AbaConnect Subdomain', placeholder: 'z.B. muellerbroker.abaconnect.ch', is_secret: false },
      { key: 'cert_secret', label: 'Zertifikatspool Kennwort', placeholder: 'Kombination aus Key & Passphrase', is_secret: true },
      { key: 'user', label: 'API Benutzername', placeholder: 'api_broker_user', is_secret: false }
    ],
    endpoints: [
      { label: 'Lohnbuchhaltung XML', url: 'https://{tenant}.abaconnect.ch/AbaConnect/Services/Payroll' },
      { label: 'Debitoren & Buchungsbelege', url: 'https://{tenant}.abaconnect.ch/AbaConnect/Services/Accounts' }
    ]
  },
  {
    code: 'google',
    name: 'Google Workspace',
    category: 'productivity',
    status: 'CONNECTED',
    description: 'Automatische Buchung von Beratungsterminen im Google Calendar und Kontaktsyndizierung.',
    required_credentials: [
      { key: 'client_id', label: 'Google Client ID', placeholder: '748123-googleusercontent.apps.googleusercontent.com', is_secret: false },
      { key: 'scopes', label: 'Erforderliche Scopes', placeholder: 'calendar.readonly, contacts.write', is_secret: false }
    ],
    endpoints: [
      { label: 'Calendar Events v3', url: 'https://www.googleapis.com/calendar/v3/calendars/' },
      { label: 'People (Contacts) v1', url: 'https://people.googleapis.com/v1/people' }
    ]
  },
  {
    code: 'microsoft',
    name: 'Microsoft 365',
    category: 'productivity',
    status: 'DISCONNECTED',
    description: 'Graph-API Integration für Outlook Kalendereinträge, Aufgabenverwaltung und Dokumentenspeicher im OneDrive.',
    required_credentials: [
      { key: 'tenant_id', label: 'Microsoft Azure Tenant ID', placeholder: 'e.g. f81d4fae-7dec-11d0-a765-00a0c91e6bf6', is_secret: false },
      { key: 'client_id', label: 'Graph Application Client ID', placeholder: 'e.g. 9bd0-9ad98273bf', is_secret: false }
    ],
    endpoints: [
      { label: 'Microsoft Graph v1.0', url: 'https://graph.microsoft.com/v1.0/me' }
    ]
  },
  {
    code: 'helvico',
    name: 'Helvico.ch',
    category: 'insurance',
    status: 'CONNECTED',
    description: 'Sofortige Online-Tarifierung von SME Cyber-, Sach- und Haftpflichtpolicen via Live API.',
    required_credentials: [
      { key: 'broker_id', label: 'Helvico Partner Agency ID', placeholder: 'z.B. HV-BROKER-9988', is_secret: false },
      { key: 'api_sandbox_key', label: 'Sandbox API Token', placeholder: 'hv_sandbox_••••••••••••', is_secret: true },
      { key: 'api_prod_key', label: 'Production API Token', placeholder: 'hv_live_••••••••••••', is_secret: true }
    ],
    endpoints: [
      { label: 'Tarifierungsrechner Engine', url: 'https://api-sandbox.helvico.ch/v1/quotes' },
      { label: 'Status Webhook Endpoint', url: 'https://api-sandbox.helvico.ch/v1/webhooks/status' }
    ]
  }
];

const INITIAL_LOGS: SyncLog[] = [
  { id: '1', provider: 'Helvico.ch', direction: 'OUTBOUND', status: 'SUCCESS', records: 1, message: 'Tarifanfrage für Cyber-Police abgeschlossen.', time: 'Heute, 11:15' },
  { id: '2', provider: 'Bexio', direction: 'INBOUND', status: 'SUCCESS', records: 12, message: 'Kundenadressbestände erfolgreich abgeglichen.', time: 'Heute, 09:30' },
  { id: '3', provider: 'Google Workspace', direction: 'OUTBOUND', status: 'SUCCESS', records: 3, message: '3 Beratungstermine synchronisiert.', time: 'Gestern, 16:45' },
  { id: '4', provider: 'Abacus ERP', direction: 'INBOUND', status: 'FAILED', records: 0, message: 'Timeout-Fehler beim AbaConnect-Handshake. Überprüfe Zertifikat.', time: 'Gestern, 14:02' }
];

export default function App() {
  // Navigation Router using reactive Hash Location
  const [hash, setHash] = useState<string>(window.location.hash || '#/clients');

  // Core system states
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [policies] = useState<Policy[]>(INITIAL_POLICIES);
  const [providers, setProviders] = useState<IntegrationProvider[]>(INITIAL_PROVIDERS);
  const [logs, setLogs] = useState<SyncLog[]>(INITIAL_LOGS);
  const [userRole, setUserRole] = useState<'BROKER_AGENT' | 'SUPER_ADMIN'>('BROKER_AGENT');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // active selected elements
  const [selectedClient, setSelectedClient] = useState<Client | null>(INITIAL_CLIENTS[0]);

  // Modal controls
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [creationTab, setCreationTab] = useState<'QUICK' | 'DETAILED'>('QUICK');
  const [detailedStep, setDetailedStep] = useState<number>(1); // 1: Stammdaten, 2: Segmentdaten, 3: Anschrift, 4: Advisor/Risiko

  // Integrations Configuration Modal
  const [selectedConfProvider, setSelectedConfProvider] = useState<IntegrationProvider | null>(null);
  const [credentialsInputs, setCredentialsInputs] = useState<Record<string, string>>({});

  // Form states - Quick Add
  const [quickForm, setQuickForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: 'PRIVATE' as 'PRIVATE' | 'CORPORATE',
    advisor_id: 'e4be0bb1-872f-410a-8dd3-62d04a600101',
    company_name: ''
  });

  // Form states - Detailed Onboarding
  const [detailedForm, setDetailedForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: 'PRIVATE' as 'PRIVATE' | 'CORPORATE',
    company_name: '',
    birth_date: '',
    marital_status: 'LEDIG',
    tax_domicile: 'ZH',
    uid_number: '',
    noga_code: '',
    employee_count: 5,
    total_payroll_sum: 250000,
    address: '',
    zip_city: '',
    country: 'Schweiz',
    advisor_id: 'e4be0bb1-872f-410a-8dd3-62d04a600101',
    trust_score: 80
  });

  // Sync / Active process triggers
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [quickErrors, setQuickErrors] = useState<string[]>([]);
  const [detailedErrors, setDetailedErrors] = useState<string[]>([]);

  // Router handler
  useEffect(() => {
    const handleHash = () => {
      setHash(window.location.hash || '#/clients');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const changeRoute = (newHash: string) => {
    window.location.hash = newHash;
    setHash(newHash);
  };

  // Synchronize dynamic lists and states
  const triggerSync = (providerName: string) => {
    const newLog: SyncLog = {
      id: String(Date.now()),
      provider: providerName,
      direction: 'OUTBOUND',
      status: 'SUCCESS',
      records: Math.floor(Math.random() * 5) + 1,
      message: `Manuelle Replikation gestartet. Datensätze synchronisiert.`,
      time: 'Gerade eben'
    };
    setLogs(prev => [newLog, ...prev]);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      const newLog: SyncLog = {
        id: String(Date.now()),
        provider: 'Bexio & Helvico',
        direction: 'OUTBOUND',
        status: 'SUCCESS',
        records: 14,
        message: 'Inbound und Outbound Sync für alle aktiven Connectoren abgeschlossen.',
        time: 'Gerade eben'
      };
      setLogs(prev => [newLog, ...prev]);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.8 }
      });
    }, 1500);
  };

  // Quick form fields validator
  const validateQuickForm = (): boolean => {
    const errs: string[] = [];
    if (!quickForm.first_name.trim()) {
      errs.push('Vorname des Kontaktpartners oder Klienten ist erforderlich.');
    }
    if (quickForm.type === 'PRIVATE' && !quickForm.last_name.trim()) {
      errs.push('Nachname ist für Privatkunden erforderlich.');
    }
    if (quickForm.type === 'CORPORATE' && !quickForm.company_name.trim()) {
      errs.push('Firmenname ist ein gesetzliches Pflichtfeld für Firmenkunden.');
    }
    if (!quickForm.email.trim()) {
      errs.push('E-Mail-Adresse ist zwingend erforderlich.');
    } else if (!quickForm.email.includes('@')) {
      errs.push('Die E-Mail-Adresse muss ein gültiges Format aufweisen (z.B. @-Symbol).');
    }
    if (!quickForm.phone.trim()) {
      errs.push('Die Schweizer Telefonnummer ist erforderlich.');
    }
    setQuickErrors(errs);
    return errs.length === 0;
  };

  // Detailed step validator
  const validateDetailedStep = (step: number): boolean => {
    const errs: string[] = [];
    if (step === 1) {
      if (!detailedForm.first_name.trim()) errs.push('Vorname ist ein zwingendes Stammdatenfeld.');
      if (!detailedForm.last_name.trim()) errs.push('Nachname ist ein zwingendes Stammdatenfeld.');
      if (!detailedForm.email.trim()) {
        errs.push('E-Mail-Adresse ist für spätere Kundenanschreiben erforderlich.');
      } else if (!detailedForm.email.includes('@')) {
        errs.push('Ungültiges E-Mail-Format.');
      }
      if (!detailedForm.phone.trim()) errs.push('Telefonnummer für den Rückruf ist erforderlich.');
    } else if (step === 2) {
      if (detailedForm.type === 'CORPORATE' && !detailedForm.company_name.trim()) {
        errs.push('Firmenname laut Handelsregister (Zefix) ist erforderlich.');
      }
    } else if (step === 3) {
      if (!detailedForm.address.trim()) errs.push('Strasse und Hausnummer sind für Versicherungsprüfungen erforderlich.');
      if (!detailedForm.zip_city.trim()) errs.push('PLZ und Ort sind zwingende Adressparameter.');
    }
    setDetailedErrors(errs);
    return errs.length === 0;
  };

  // Submit Quick Add Customer
  const submitQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQuickForm()) return;

    const advisor = INITIAL_ADVISORS.find(a => a.id === quickForm.advisor_id);
    
    const newClient: Client = {
      id: 'quick-' + Date.now(),
      tenant_id: 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1',
      advisor_id: quickForm.advisor_id,
      advisor_name: advisor ? advisor.name : 'Max Muster (Senior Advisor)',
      type: quickForm.type,
      status: 'ONBOARDING',
      company_name: quickForm.type === 'CORPORATE' ? quickForm.company_name : null,
      first_name: quickForm.first_name,
      last_name: quickForm.type === 'PRIVATE' ? quickForm.last_name : 'Ansprechpartner',
      email: quickForm.email,
      phone: quickForm.phone,
      address: 'Nicht erfasst (Schnellerfassung)',
      zip_city: 'Nicht erfasst',
      country: 'Schweiz',
      trust_score: 50,
      tax_domicile: 'ZH',
      marital_status: 'LEDIG'
    };

    setClients([newClient, ...clients]);
    setSelectedClient(newClient);
    setIsNewClientModalOpen(false);
    setQuickErrors([]);
    
    // Clear forms
    setQuickForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      type: 'PRIVATE',
      advisor_id: 'e4be0bb1-872f-410a-8dd3-62d04a600101',
      company_name: ''
    });

    // Fire Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Submit Detailed Customer Onboarding
  const submitDetailedAdd = () => {
    // Validate everything up to final step
    for (let s = 1; s <= 3; s++) {
      if (!validateDetailedStep(s)) {
        setDetailedStep(s);
        return;
      }
    }

    const advisor = INITIAL_ADVISORS.find(a => a.id === detailedForm.advisor_id);
    
    const newClient: Client = {
      id: 'detailed-' + Date.now(),
      tenant_id: 'd78b87d5-cc72-46a2-bc42-99933fd2fbb1',
      advisor_id: detailedForm.advisor_id,
      advisor_name: advisor ? advisor.name : 'Max Muster (Senior Advisor)',
      type: detailedForm.type,
      status: 'ACTIVE',
      company_name: detailedForm.type === 'CORPORATE' ? detailedForm.company_name : null,
      first_name: detailedForm.first_name,
      last_name: detailedForm.last_name,
      email: detailedForm.email,
      phone: detailedForm.phone,
      address: detailedForm.address,
      zip_city: detailedForm.zip_city,
      country: detailedForm.country || 'Schweiz',
      uid_number: detailedForm.type === 'CORPORATE' ? detailedForm.uid_number : null,
      noga_code: detailedForm.type === 'CORPORATE' ? detailedForm.noga_code : null,
      employee_count: detailedForm.type === 'CORPORATE' ? detailedForm.employee_count : null,
      total_payroll_sum: detailedForm.type === 'CORPORATE' ? detailedForm.total_payroll_sum : null,
      birth_date: detailedForm.birth_date || '1990-01-01',
      tax_domicile: detailedForm.tax_domicile,
      marital_status: detailedForm.marital_status,
      trust_score: detailedForm.trust_score
    };

    setClients([newClient, ...clients]);
    setSelectedClient(newClient);
    setIsNewClientModalOpen(false);
    setDetailedStep(1);
    setDetailedErrors([]);

    // Trigger full synchronisation simulation log which matches database structure
    const syncLog: SyncLog = {
      id: String(Date.now()),
      provider: 'Bexio',
      direction: 'OUTBOUND',
      status: 'SUCCESS',
      records: 1,
      message: `Neuer Klient "${newClient.first_name} ${newClient.last_name}" erfolgreich in Bexio CRM und Abrechnung angelegt.`,
      time: 'Gerade eben'
    };
    setLogs(prev => [syncLog, ...prev]);

    // Reset Form
    setDetailedForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      type: 'PRIVATE',
      company_name: '',
      birth_date: '',
      marital_status: 'LEDIG',
      tax_domicile: 'ZH',
      uid_number: '',
      noga_code: '',
      employee_count: 5,
      total_payroll_sum: 250000,
      address: '',
      zip_city: '',
      country: 'Schweiz',
      advisor_id: 'e4be0bb1-872f-410a-8dd3-62d04a600101',
      trust_score: 80
    });

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });
  };

  // Toggle provider connection state
  const handleToggleConnection = (providerCode: string) => {
    const provider = providers.find(p => p.code === providerCode);
    if (!provider) return;

    const nextStatus = provider.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';

    setProviders(prev => prev.map(p =>
      p.code === providerCode ? { ...p, status: nextStatus } : p
    ));

    // Log state changes matching integration_sync_logs tables
    const logMsg = nextStatus === 'CONNECTED'
      ? `Schnittstelle ${provider.name} wurde erfolgreich autorisiert und verbunden.`
      : `Schnittstelle ${provider.name} wurde ordnungsgemäss getrennt.`;

    setLogs(prevLogs => [{
      id: String(Date.now()),
      provider: provider.name,
      direction: nextStatus === 'CONNECTED' ? 'INBOUND' : 'OUTBOUND',
      status: 'SUCCESS',
      records: nextStatus === 'CONNECTED' ? 3 : 0,
      message: logMsg,
      time: 'Gerade eben'
    }, ...prevLogs]);

    setSelectedConfProvider(null);
  };

  // Open config drawer
  const triggerProviderConfig = (provider: IntegrationProvider) => {
    setSelectedConfProvider(provider);
    const initialInputs: Record<string, string> = {};
    provider.required_credentials.forEach(cred => {
      initialInputs[cred.key] = '';
    });
    setCredentialsInputs(initialInputs);
  };

  // Filter client listings
  const filteredClients = clients.filter(c => {
    const fullName = `${c.first_name} ${c.last_name} ${c.company_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && c.type === filterType;
  });

  return (
    <div id="swissbroker-app" className="flex flex-col h-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      
      {/* ==========================================
          HEADER PANEL & ROLE SELECTOR
          ========================================== */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 font-bold text-white shadow-lg shadow-sky-500/20">
            CH
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SwissBroker OS
              <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-400/20">
                PRO-Cloud
              </span>
            </h1>
            <p className="text-xs text-slate-400">Automated Financial & Insurtech Operations</p>
          </div>
        </div>

        {/* Global Action items & role trigger */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              id="role-broker"
              onClick={() => {
                setUserRole('BROKER_AGENT');
                if (hash === '#/admin') changeRoute('#/clients');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${userRole === 'BROKER_AGENT' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Broker / Advisor View
            </button>
            <button 
              id="role-admin"
              onClick={() => {
                setUserRole('SUPER_ADMIN');
                changeRoute('#/admin');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${userRole === 'SUPER_ADMIN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Sliders className="h-3 w-3" />
              Super-Admin
            </button>
          </div>

          <button 
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className={`flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50 transition`}
          >
            <RotateCw className={`h-3 w-3 ${isSyncingAll ? 'animate-spin' : ''}`} />
            {isSyncingAll ? 'Synchronisiere...' : 'Global Sync'}
          </button>
        </div>
      </header>

      {/* ==========================================
          MAIN NAVIGATION & WORKSPACE BODY
          ========================================== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Brokerage CRM</p>
              <nav className="mt-2 space-y-1">
                <button 
                  id="nav-clients"
                  onClick={() => changeRoute('#/clients')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${hash === '#/clients' ? 'bg-slate-800 text-sky-400 shadow-inner' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Users className="h-4 w-4" />
                  Kundenstamm
                  <span className="ml-auto rounded-full bg-slate-950 px-2 py-0.5 text-xs text-slate-400">
                    {clients.length}
                  </span>
                </button>

                <button 
                  id="nav-policies"
                  onClick={() => changeRoute('#/policies')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${hash === '#/policies' ? 'bg-slate-800 text-sky-400 shadow-inner' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <FileText className="h-4 w-4" />
                  Versicherungen
                  <span className="ml-auto rounded-full bg-slate-950 px-2 py-0.5 text-xs text-slate-400">
                    {policies.length}
                  </span>
                </button>
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Integrationsfokus</p>
              <nav className="mt-2 space-y-1">
                <button 
                  id="nav-integrations"
                  onClick={() => changeRoute('#/integrations')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${hash === '#/integrations' ? 'bg-slate-800 text-sky-400 shadow-inner' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Network className="h-4 w-4" />
                  Schnittstellen
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>
              </nav>
            </div>
            
            {userRole === 'SUPER_ADMIN' && (
              <div>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">System Management</p>
                <nav className="mt-2 space-y-1">
                  <button 
                    id="nav-admin"
                    onClick={() => changeRoute('#/admin')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${hash === '#/admin' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                  >
                    <Sliders className="h-4 w-4" />
                    Global Providers Sync
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Connected Tenant / Status Indicator */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Mandant:</span>
              <span className="font-semibold text-white">Muster Broker AG</span>
            </div>
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulsing-dot"></span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Verbindung bereit</span>
            </div>
          </div>
        </aside>

        {/* Content View Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 subtle-grid relative">
          
          {/* ==========================================
              ROUTE 1: CLIENTS PAGE (KUNDENSTAMM)
              ========================================== */}
          {hash === '#/clients' && (
            <div className="space-y-6">
              
              {/* Header block + Primary Action with NO dead buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Kundenverwaltung (CRM)</h2>
                  <p className="text-sm text-slate-400">Verwalte deine privaten und Firmenberatungskunden und starte Schnittstellen-Exporte.</p>
                </div>
                
                {/* Neuer Klient Button - TRICGERS MODAL */}
                <button 
                  id="btn-add-client-modal"
                  onClick={() => setIsNewClientModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-sky-500/20 transition-all border border-sky-400/30"
                >
                  <Plus className="h-4 w-4" />
                  + Neuer Klient
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input 
                    type="text"
                    placeholder="Suche nach Name, E-Mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 pl-10 pr-4 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">Alle Kundentypen</option>
                    <option value="PRIVATE">Privatpersonen (Private)</option>
                    <option value="CORPORATE">Firmenkunden (Corporate)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end text-xs text-slate-400">
                  Zeigt {filteredClients.length} von {clients.length} registrierten Klienten
                </div>
              </div>

              {/* Main Core Viewport: Horizontal split list & details card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* List portion */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/85">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Klientenliste</h3>
                  </div>
                  <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full text-left p-4 transition-all flex items-center justify-between hover:bg-slate-800/40 ${selectedClient?.id === client.id ? 'bg-slate-800/70 border-l-4 border-sky-500 pl-3' : ''}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">
                              {client.type === 'CORPORATE' ? client.company_name : `${client.first_name} ${client.last_name}`}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${client.type === 'CORPORATE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                              {client.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            {client.type === 'CORPORATE' && (
                              <span className="text-slate-300">Ansprechpartner: {client.first_name} {client.last_name}</span>
                            )}
                            {client.type === 'PRIVATE' && (
                              <span>Domicile: {client.tax_domicile} | Kanton {client.tax_domicile}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${client.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                            {client.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Score: {client.trust_score}%</span>
                        </div>
                      </button>
                    ))}

                    {filteredClients.length === 0 && (
                      <div className="p-8 text-center text-slate-500">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        Keine Kunden gefunden, die den Kriterien entsprechen.
                      </div>
                    )}
                  </div>
                </div>

                {/* Details card with interactive items - NO dead buttons */}
                <div className="lg:col-span-7">
                  {selectedClient ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6 p-6">
                      
                      {/* Name Card Panel */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="p-2.5 rounded-lg bg-sky-500/15 text-sky-400">
                              {selectedClient.type === 'CORPORATE' ? <Building2 className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                            </span>
                            <div>
                              <h3 className="text-xl font-bold text-white tracking-tight">
                                {selectedClient.type === 'CORPORATE' ? selectedClient.company_name : `${selectedClient.first_name} ${selectedClient.last_name}`}
                              </h3>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {selectedClient.address}, {selectedClient.zip_city} ({selectedClient.country})
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Qualitäts-Score</div>
                          <div className="text-3xl font-extrabold text-sky-400">{selectedClient.trust_score}<span className="text-xs text-slate-500">/100</span></div>
                        </div>
                      </div>

                      {/* Client parameters grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kontakte & Details</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-slate-500">Telefon:</span> <span className="text-slate-200">{selectedClient.phone}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">E-Mail:</span> <span className="text-slate-200 underline">{selectedClient.email}</span></div>
                            {selectedClient.type === 'PRIVATE' && (
                              <>
                                <div className="flex justify-between"><span className="text-slate-500">Geburtstag:</span> <span className="text-slate-200">{selectedClient.birth_date}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Zivilstand:</span> <span className="text-slate-200">{selectedClient.marital_status}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Steuerdomizil:</span> <span className="text-slate-200">Kanton {selectedClient.tax_domicile}</span></div>
                              </>
                            )}
                            {selectedClient.type === 'CORPORATE' && (
                              <>
                                <div className="flex justify-between"><span className="text-slate-500">CHE-UID:</span> <span className="text-slate-200 font-mono">{selectedClient.uid_number || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">NOGA Code:</span> <span className="text-slate-200">{selectedClient.noga_code || 'N/A'}</span></div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Betreuung</h4>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-200">{selectedClient.advisor_name}</p>
                              <p className="text-[11px] text-slate-400">Hauptverantwortlicher Broker im System</p>
                            </div>
                          </div>
                          
                          {/* Sync Action buttons context */}
                          <div className="pt-4 border-t border-slate-850 mt-4 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">3rd Party Export</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => triggerSync('Bexio')}
                                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-sky-400 rounded transition"
                              >
                                Bexio Sync
                              </button>
                              <button 
                                onClick={() => triggerSync('Helvico')}
                                className="px-2.5 py-1 bg-sky-650 hover:bg-sky-600 text-[11px] text-white rounded transition font-medium"
                              >
                                Helvico Live
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Linked Policies and Insurances - fully interactive */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aktive Verträge & Policen</h4>
                        <div className="space-y-2">
                          {policies.filter(p => p.client_id === selectedClient.id).map(policy => (
                            <div key={policy.id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-100">{policy.type}</span>
                                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-sky-400 font-semibold">{policy.insurer}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 font-mono">ID: {policy.policy_number}</p>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-semibold text-white">CHF {policy.premium_amount.toLocaleString()}/Jahr</div>
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-0.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  Deckung aktiv
                                </span>
                              </div>
                            </div>
                          ))}

                          {policies.filter(p => p.client_id === selectedClient.id).length === 0 && (
                            <div className="bg-slate-950 p-6 rounded-lg text-center border border-dashed border-slate-800 text-slate-500 text-xs">
                              Bisher keine Policen erfasst. Verwende "Helvico Live" oben, um direkt eine zu generieren.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                      <Users className="mx-auto h-12 w-12 text-slate-700 mb-3" />
                      Wähle links einen Klienten aus, um seine vollständigen Parameter, Policen und Schnittstellenmappings einzusehen.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              ROUTE 2: POLICIES PAGE (VERSICHERUNCEN)
              ========================================== */}
          {hash === '#/policies' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Versicherungspolicen</h2>
                <p className="text-sm text-slate-400">Komplettübersicht aller bestehenden Versicherungsverträge deiner Klienten im System.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Seeded stats summaries */}
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-slate-300">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Prämienvolumen (Geseedet)</p>
                  <p className="text-2xl font-extrabold text-sky-400">CHF 2'750.00</p>
                  <span className="text-[10px] text-slate-400">Verteilt auf 3 aktive Policen</span>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-slate-300">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Verbunden mit Bexio</p>
                  <p className="text-2xl font-extrabold text-emerald-400">100%</p>
                  <span className="text-[10px] text-slate-400">Alle Verträge im Buchhaltungssync</span>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-slate-300">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Verfügbare Tarifierer</p>
                  <p className="text-2xl font-extrabold text-amber-400">Helvico SME API</p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    Cyber & SME Liability online live
                  </span>
                </div>
              </div>

              {/* Table list of all contracts */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white">Datenbestände aus der Seed-Migration</h3>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Gesichert mit RLS Policies</span>
                </div>
                
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <th className="p-4">Kunde</th>
                      <th className="p-4">Versicherer & Typ</th>
                      <th className="p-4">Policen-Nummer</th>
                      <th className="p-4">Prämie / Jahr</th>
                      <th className="p-4 font-mono">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {policies.map(p => {
                      const c = clients.find(cl => cl.id === p.client_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/20 text-slate-200">
                          <td className="p-4 font-medium text-white">
                            {c ? (c.type === 'CORPORATE' ? c.company_name : `${c.first_name} ${c.last_name}`) : 'Klient Unbekannt'}
                          </td>
                          <td className="p-4">
                            <span className="text-sky-400 font-bold block">{p.type}</span>
                            <span className="text-[10px] text-slate-500">{p.insurer} Versicherung</span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{p.policy_number}</td>
                          <td className="p-4 text-slate-100 font-semibold">CHF {p.premium_amount.toLocaleString()}-</td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              ROUTE 3: INTERACTION & CONNECT DIRECTORY (INTEGRATIONS)
              ========================================== */}
          {hash === '#/integrations' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Introduction header */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Network className="h-6 w-6 text-sky-400" />
                  Schnittstellen & Drittsysteme
                </h2>
                <p className="text-sm text-slate-400">Verbinde dein Schweizer CRM nahtlos mit Bexio, Abacus ERP, Google, Microsoft oder Helvico.</p>
              </div>

              {/* Requirements block as demanded by the client (sage mir was du dazu alles benötgist?) */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-sky-500/15 shadow-xl relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 opacity-5 text-sky-400">
                  <Database className="h-64 w-62" />
                </div>
                
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  Schnittstellen-Anforderungen: Was wird für die Integration benötigt?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl mb-4">
                  Die Integrationen sind in der Anwendungs- und Tabellenstruktur bereits komplett vorbereitet. 
                  Um die echten Schnittstellen künftig mit Live-Daten zu befeuern, müssen für die jeweiligen APIs folgende Secrets vorliegen. 
                  Du kannst diese als Super-Admin oder direkt hier hinterlegen:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/90 p-4 border border-slate-800/80 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-amber-400">
                      <span className="p-1 rounded bg-amber-500/10">BX</span>
                      Bexio (CRM / Buchhaltung)
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                      <li>Bexio <span className="text-white">Client ID</span> & <span className="text-white">Client Secret</span></li>
                      <li>Erstellte App im Bexio Developer Portal</li>
                      <li>Redirect URL im Endpoint-Mapping</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/90 p-4 border border-slate-800/80 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-red-500">
                      <span className="p-1 rounded bg-red-500/10">AB</span>
                      Abacus AbaConnect ERP
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                      <li>Eigene Abaconnect Subdomain</li>
                      <li><span className="text-white">p12 Client-Zertifikat</span> & Passphrase</li>
                      <li>AbaConnect API Benutzerkonten</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/90 p-4 border border-slate-800/80 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-sky-400">
                      <span className="p-1 rounded bg-sky-500/10">HV</span>
                      Helvico.ch (SME Tarifierer)
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                      <li><span className="text-white">Partner Agency ID</span> (HV-BROKER)</li>
                      <li>Live API Key & Sandbox API Key</li>
                      <li>Webhook Empfänger URL (Public App URL)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Grid directory of providers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(provider => {
                  const isConnected = provider.status === 'CONNECTED';
                  return (
                    <div key={provider.code} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white tracking-wide">{provider.name}</h3>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                            {provider.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{provider.description}</p>
                      </div>

                      <div className="pt-5 border-t border-slate-800 bg-transparent flex items-center justify-between mt-5">
                        <button 
                          onClick={() => triggerProviderConfig(provider)}
                          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                        >
                          <Settings className="h-3 w-3" />
                          Einrichten
                        </button>
                        
                        <button 
                          onClick={() => handleToggleConnection(provider.code)}
                          className={`text-xs font-bold px-3 py-1.5 rounded transition ${isConnected ? 'bg-amber-600/15 text-amber-500 border border-amber-500/20 hover:bg-amber-600/30' : 'bg-sky-600 hover:bg-sky-500 text-white shadow shadow-sky-500/20'}`}
                        >
                          {isConnected ? 'Trennen' : 'Verbinden'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Horizontal Split and synchronization monitor block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                
                {/* Outlining active tables mappings for super admin */}
                <div className="lg:col-span-4 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-sky-400" />
                    Datenbank-Struktur (Postgres)
                  </h3>
                  <p className="text-xs text-slate-400">Die neu ausgeführten relationalen Tabellen für die Replikation:</p>
                  
                  <div className="space-y-2.5 text-[11px]">
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                      <span className="font-mono text-slate-300">integration_providers</span>
                      <span className="text-emerald-400">Aktiv & Seeding OK</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                      <span className="font-mono text-slate-300">tenant_integrations</span>
                      <span className="text-emerald-400">RLS Secured (Row Level)</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                      <span className="font-mono text-slate-300">integration_external_mappings</span>
                      <span className="text-sky-400 font-medium">Auto mapping ON</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                      <span className="font-mono text-slate-300">integration_sync_logs</span>
                      <span className="text-slate-400">Audit-ready</span>
                    </div>
                  </div>
                </div>

                {/* Live Realtime Sync Logs Feed */}
                <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Replikations- & Synchronisationsprotokoll</h3>
                    <span className="text-[10px] text-sky-400 animate-pulse flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-sky-400"></span> Live Monitoring
                    </span>
                  </div>

                  <div className="p-4 divide-y divide-slate-800/80 overflow-y-auto max-h-[250px]">
                    {logs.map(log => (
                      <div key={log.id} className="py-3 flex items-start justify-between text-xs transition hover:bg-slate-800/10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{log.provider}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${log.direction === 'INBOUND' ? 'bg-sky-500/10 text-sky-400' : 'bg-pink-500/10 text-pink-400'}`}>
                              {log.direction}
                            </span>
                          </div>
                          <p className="text-slate-400">{log.message}</p>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {log.status}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              ROUTE 4: THE SUPER-ADMINISTRATOR VIEW
              ========================================== */}
          {hash === '#/admin' && userRole === 'SUPER_ADMIN' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Global Integration Provider Registry</h2>
                  <p className="text-sm text-slate-400">Verwalte die globalen OAuth ClientIDs, Endpunkte und Tokens für alle Broker-Mandanten der Schweiz.</p>
                </div>
              </div>

              {/* Admin parameters control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-4">
                  <h3 className="text-base font-bold text-white">1. Globale Redirect Endpoints & Proxies</h3>
                  <p className="text-xs text-slate-400">Diese URIs sind für die App im Developer Portal der Anbieter (z.B. Bexio) registriert:</p>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block uppercase text-[10px]">OAuth Redirect URI (Global)</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="https://swissbroker-os.vercel.app/api/auth/bexio/callback"
                        className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 font-mono text-center cursor-not-allowed select-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block uppercase text-[10px]">Helvico Cyber Quotation Proxy</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="https://swissbroker-os.vercel.app/api/premium/helvico/quote"
                        className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 font-mono text-center cursor-not-allowed select-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-4">
                  <h3 className="text-base font-bold text-white">2. Globale API Health-Checks</h3>
                  <p className="text-xs text-slate-400">Status und Latenzzeiten der externen Schweizer Hostingpartner:</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded">
                      <span className="font-bold">Bexio v2.0 API</span>
                      <span className="text-emerald-400 font-bold">● Operational (42ms)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded">
                      <span className="font-bold">Helvico Sandbox API</span>
                      <span className="text-emerald-400 font-bold">● Operational (28ms)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded">
                      <span className="font-bold">Abacus AbaConnect Pool</span>
                      <span className="text-slate-500 font-bold">● Waiting credentials</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          MODAL: NEW CUSTOMER (ZEI WECE: QUICK ADD & DETAILED)
          ========================================== */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between">
            
            {/* Header + Selection tab controls */}
            <div className="border-b border-slate-800 p-5 bg-slate-900/60 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">+ Neuen Klient erfassen</h3>
                <button 
                  onClick={() => { setIsNewClientModalOpen(false); setQuickErrors([]); setDetailedErrors([]); }}
                  className="p-1 rounded hover:bg-slate-800/80 text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* TWO PATHWAYS FOR CUSTOMER IMPORT REQUIRED BY USER */}
              <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button 
                  id="tab-quick-add"
                  onClick={() => { setCreationTab('QUICK'); setQuickErrors([]); setDetailedErrors([]); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${creationTab === 'QUICK' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  ⚡ Schnellerfassung (Quick Add)
                </button>
                <button 
                  id="tab-detailed-add"
                  onClick={() => { setCreationTab('DETAILED'); setQuickErrors([]); setDetailedErrors([]); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${creationTab === 'DETAILED' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  📋 Detaillierte Aufnahme (Complete Intake)
                </button>
              </div>
            </div>

            {/* Scrollable Form Body Container */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh]">
              
              {/* WAY A: QUICK ADD WORKFLOW (Schnellerfassung) */}
              {creationTab === 'QUICK' && (
                <form onSubmit={submitQuickAdd} className="space-y-4">
                  <p className="text-xs text-slate-400">Schnelles Erstellen mit Kontaktparametern. Unverzüglich bereit für Buchhaltung & Sync.</p>

                  {quickErrors.length > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 space-y-1">
                      <p className="font-bold flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Bitte korrigiere die folgenden Eingaben:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-95">
                        {quickErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {/* Select Customer Segment */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Klientensegment</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300">
                        <input 
                          type="radio" 
                          name="quickType" 
                          checked={quickForm.type === 'PRIVATE'} 
                          onChange={() => setQuickForm({ ...quickForm, type: 'PRIVATE' })}
                        />
                        Privatperson (Private)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300">
                        <input 
                          type="radio" 
                          name="quickType"
                          checked={quickForm.type === 'CORPORATE'}
                          onChange={() => setQuickForm({ ...quickForm, type: 'CORPORATE' })}
                        />
                        Firmenkunde / KMU (Corporate)
                      </label>
                    </div>
                  </div>

                  {quickForm.type === 'CORPORATE' && (
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold block">Firmenname (Pflichtfeld)</label>
                      <input 
                        type="text"
                        required
                        placeholder="z.B. Müller Spedition AG"
                        value={quickForm.company_name}
                        onChange={(e) => setQuickForm({ ...quickForm, company_name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs focus:outline-none focus:border-sky-500 text-white"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold block">Vorname / Ansprechpartner</label>
                      <input 
                        type="text"
                        placeholder="Hans"
                        value={quickForm.first_name}
                        onChange={(e) => setQuickForm({ ...quickForm, first_name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs focus:outline-none focus:border-sky-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold block">{quickForm.type === 'PRIVATE' ? 'Nachname (Pflichtfeld)' : 'Nachname Kontakt'}</label>
                      <input 
                        type="text"
                        required={quickForm.type === 'PRIVATE'}
                        placeholder="Muster"
                        value={quickForm.last_name}
                        onChange={(e) => setQuickForm({ ...quickForm, last_name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs focus:outline-none focus:border-sky-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold block">Telefonnummer</label>
                      <input 
                        type="text"
                        placeholder="+41 79 123 45 67"
                        value={quickForm.phone}
                        onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs focus:outline-none focus:border-sky-500 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold block">E-Mail Adresse</label>
                      <input 
                        type="email"
                        placeholder="name@anbieter.ch"
                        value={quickForm.email}
                        onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs focus:outline-none focus:border-sky-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Zugeordneter Broker / Advisor</label>
                    <select
                      value={quickForm.advisor_id}
                      onChange={(e) => setQuickForm({ ...quickForm, advisor_id: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs text-white"
                    >
                      {INITIAL_ADVISORS.map(adv => (
                        <option key={adv.id} value={adv.id}>{adv.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => setIsNewClientModalOpen(false)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Abbrechen
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow shadow-sky-500/20"
                    >
                      ⚡ Speichern & Anlegen
                    </button>
                  </div>
                </form>
              )}

              {/* WAY B: DETAILED ADMISSION ONBOARDING FLOW (Detaillierte Erfassung) */}
              {creationTab === 'DETAILED' && (
                <div className="space-y-4">
                  {/* Stepper Wizard Indicator */}
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    <span className={detailedStep === 1 ? 'text-sky-400' : 'text-slate-500'}>1. Stammdaten</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    <span className={detailedStep === 2 ? 'text-sky-400' : 'text-slate-500'}>2. Segmentprofil</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    <span className={detailedStep === 3 ? 'text-sky-400' : 'text-slate-500'}>3. Anschrift</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    <span className={detailedStep === 4 ? 'text-sky-400' : 'text-slate-500'}>4. Advisor & Risiko</span>
                  </div>

                  {detailedErrors.length > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 space-y-1 animate-fade-in">
                      <p className="font-bold flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Bitte korrigiere die Eingaben für Schritt {detailedStep}:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-95">
                        {detailedErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* STEP 1: Stammdaten und Basis-onboarding */}
                  {detailedStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Kundentyp</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-xs text-slate-300">
                            <input 
                              type="radio" 
                              checked={detailedForm.type === 'PRIVATE'} 
                              onChange={() => setDetailedForm({ ...detailedForm, type: 'PRIVATE' })}
                            />
                            Privatperson
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-300">
                            <input 
                              type="radio" 
                              checked={detailedForm.type === 'CORPORATE'} 
                              onChange={() => setDetailedForm({ ...detailedForm, type: 'CORPORATE' })}
                            />
                            Firmenkunde (SME / KMU)
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-semibold block">Vorname*</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Anneliese"
                            value={detailedForm.first_name}
                            onChange={(e) => setDetailedForm({ ...detailedForm, first_name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs focus:outline-none focus:border-sky-500 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-semibold block">Nachname*</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Muster-Huber"
                            value={detailedForm.last_name}
                            onChange={(e) => setDetailedForm({ ...detailedForm, last_name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs focus:outline-none focus:border-sky-500 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-semibold block">Direktruf Telefon*</label>
                          <input 
                            type="text" 
                            required
                            placeholder="+41 79 321 00 22"
                            value={detailedForm.phone}
                            onChange={(e) => setDetailedForm({ ...detailedForm, phone: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-semibold block">E-Mail*</label>
                          <input 
                            type="email" 
                            required
                            placeholder="a.huber@swissmail.ch"
                            value={detailedForm.email}
                            onChange={(e) => setDetailedForm({ ...detailedForm, email: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Segmentprofil & Zusatzinformationen */}
                  {detailedStep === 2 && (
                    <div className="space-y-4">
                      {detailedForm.type === 'PRIVATE' ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400 font-semibold block">Geburtsdatum</label>
                              <input 
                                type="date" 
                                value={detailedForm.birth_date} 
                                onChange={(e) => setDetailedForm({ ...detailedForm, birth_date: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400 font-semibold block">Zivilstand</label>
                              <select 
                                value={detailedForm.marital_status} 
                                onChange={(e) => setDetailedForm({ ...detailedForm, marital_status: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                              >
                                <option value="LEDIG">Ledig</option>
                                <option value="VERHEIRATET">Verheiratet</option>
                                <option value="GESCHIEDEN">Geschieden</option>
                                <option value="VERWITWET">Verwitwet</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-semibold block">Steuerkanton (Tax Domicile)*</label>
                            <select 
                              value={detailedForm.tax_domicile} 
                              onChange={(e) => setDetailedForm({ ...detailedForm, tax_domicile: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                            >
                              <option value="ZH">Zürich (ZH)</option>
                              <option value="BE">Bern (BE)</option>
                              <option value="SG">St. Gallen (SG)</option>
                              <option value="BS">Basel-Stadt (BS)</option>
                              <option value="GE">Genf (GE)</option>
                              <option value="AG">Aargau (AG)</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-semibold block">Firmenname (aus Zefix)*</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Müller Engineering GmbH"
                              value={detailedForm.company_name}
                              onChange={(e) => setDetailedForm({ ...detailedForm, company_name: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400 font-semibold block">Eidg. UID-Code CHE-xxx.xxx.xxx</label>
                              <input 
                                type="text" 
                                placeholder="CHE-998.112.333"
                                value={detailedForm.uid_number}
                                onChange={(e) => setDetailedForm({ ...detailedForm, uid_number: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400 font-semibold block">NOGA Branchen-Zweig</label>
                              <input 
                                type="text" 
                                placeholder="70.22 (Beratung)"
                                value={detailedForm.noga_code}
                                onChange={(e) => setDetailedForm({ ...detailedForm, noga_code: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400 font-semibold block">Mitarbeiteranzahl (FTE)</label>
                              <input 
                                type="number" 
                                value={detailedForm.employee_count} 
                                onChange={(e) => setDetailedForm({ ...detailedForm, employee_count: Number(e.target.value) })}
                                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400 font-semibold block">Jährliche BVG Lohnsumme (CHF)</label>
                              <input 
                                type="number" 
                                value={detailedForm.total_payroll_sum} 
                                onChange={(e) => setDetailedForm({ ...detailedForm, total_payroll_sum: Number(e.target.value) })}
                                className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: Anschrift & Landeskoordination */}
                  {detailedStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold block">Strasse & Hausnummer*</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Limmatquai 12"
                          value={detailedForm.address}
                          onChange={(e) => setDetailedForm({ ...detailedForm, address: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-slate-400 font-semibold block">PLZ & Ort*</label>
                          <input 
                            type="text" 
                            required
                            placeholder="8001 Zürich"
                            value={detailedForm.zip_city}
                            onChange={(e) => setDetailedForm({ ...detailedForm, zip_city: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-semibold block">Land*</label>
                          <input 
                            type="text" 
                            readOnly
                            value={detailedForm.country}
                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Advisor & Risikomanagement */}
                  {detailedStep === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold block">Betreuer & Advisor*</label>
                        <select 
                          value={detailedForm.advisor_id} 
                          onChange={(e) => setDetailedForm({ ...detailedForm, advisor_id: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white"
                        >
                          {INITIAL_ADVISORS.map(adv => (
                            <option key={adv.id} value={adv.id}>{adv.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-400 font-semibold">Geschätzte Vertrauens- & Bonitätsstufe (%)</label>
                          <span className="text-sky-400 font-bold">{detailedForm.trust_score}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="30" 
                          max="100" 
                          value={detailedForm.trust_score}
                          onChange={(e) => setDetailedForm({ ...detailedForm, trust_score: Number(e.target.value) })}
                          className="w-full bg-slate-950 accent-sky-500 border border-slate-800 h-2 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Wizard Bottom buttons */}
                  <div className="pt-6 border-t border-slate-800 flex justify-between shrink-0">
                    <button 
                      type="button"
                      disabled={detailedStep === 1}
                      onClick={() => { setDetailedStep(prev => prev - 1); setDetailedErrors([]); }}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 disabled:opacity-35 transition"
                    >
                      Zurück
                    </button>

                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => { setIsNewClientModalOpen(false); setQuickErrors([]); setDetailedErrors([]); }}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400"
                      >
                        Abbrechen
                      </button>

                      {detailedStep < 4 ? (
                        <button 
                          type="button"
                          onClick={() => {
                            if (validateDetailedStep(detailedStep)) {
                              setDetailedStep(prev => prev + 1);
                            }
                          }}
                          className="px-5 py-2 bg-sky-650 hover:bg-sky-600 text-white text-xs font-bold rounded-lg shadow shadow-sky-500/20"
                        >
                          Weiter
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={submitDetailedAdd}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20"
                        >
                          ✓ Komplette Aufnahme abschliessen
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: INTERACTIVE SCHNITTSTELLE CONFIG DRAWER
          ========================================== */}
      {selectedConfProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Einrichtung: {selectedConfProvider.name}</h3>
              <button 
                onClick={() => setSelectedConfProvider(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Trage hier die offiziellen Zugangsdaten deines Mandanten oder Administrators ein, um die direkte Sync-Operation scharf zu schalten.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleToggleConnection(selectedConfProvider.code); }} className="space-y-3.5">
              {selectedConfProvider.required_credentials.map(cred => (
                <div key={cred.key} className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">{cred.label}</label>
                  <input 
                    type={cred.is_secret ? 'password' : 'text'}
                    required
                    placeholder={cred.placeholder}
                    value={credentialsInputs[cred.key] || ''}
                    onChange={(e) => setCredentialsInputs({ ...credentialsInputs, [cred.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 text-xs rounded text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              ))}

              <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Verfügbare Endpoints</span>
                {selectedConfProvider.endpoints.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{ep.label}:</span>
                    <span className="truncate ml-2 max-w-[200px] text-sky-400 font-mono text-[10px]">{ep.url}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setSelectedConfProvider(null)}
                  className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-xs text-slate-400"
                >
                  Abbrechen
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-xs rounded shadow"
                >
                  Schnittstelle validieren & aktivieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
