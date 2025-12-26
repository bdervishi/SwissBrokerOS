
import { AssetType, Client, MortgageType, Policy, PolicyStatus, UserRole, AIAdvice, Asset, MortgageScenario, Integration, IntegrationCategory, IntegrationStatus, PolicyDocument, Claim, Partner, PartnerCategory, PartnerStatus, CalendarEvent, EventType, RelatedEntityType, Commission, CommissionType, CommissionStatus, User, Tenant, SaaSPackage, Email, Team, TimeEntry, TaxSummary, TaxReturn, Testimonial } from './types';

export const APP_NAME = "SwissBroker OS";

// --- MOCK TESTIMONIALS ---
export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote: "Die Liebe zum Detail ist unübertroffen. Jede Interaktion mit SwissBroker OS fühlt sich durchdacht und effizient an.",
    author: "Sarah Chen",
    role: "Inhaberin",
    company: "Zürich-Versicherungsmakler AG",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/professional-woman-minimal-portrait-JIXD2g3xUKSkFHnS0FEQZV7XFVRh96.png",
  },
  {
    id: "t2",
    quote: "Endlich eine Software, die versteht, dass Einfachheit die höchste Form der Raffinesse im Finanzmarkt ist.",
    author: "Marcus Webb",
    role: "CEO",
    company: "Luzern Finance Consult",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/professional-woman-asian-portrait-minimal-3JNilSFq6Lws8Gujkq8ZsV4v5owg2j.jpg",
  },
  {
    id: "t3",
    quote: "Diese Plattform hat unsere gesamte Herangehensweise an digitale Kundenerlebnisse neu definiert.",
    author: "Elena Frost",
    role: "Head of Insurance",
    company: "Swiss Safe Brokers",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/professional-man-minimal-portrait-iJTSwKlJgwle9ZhX3NdX2gDFF6hamm.png",
  },
];

// ... rest of the constants.ts file (MOCK_TEAMS, MOCK_USERS, etc.)
export const MOCK_TEAMS: Team[] = [
    { id: 'team_mgmt', name: 'Geschäftsleitung', leaderId: 'u_broker_1' },
    { id: 'team_sales', name: 'Vertrieb & Aussendienst', leaderId: 'u_agent_1' },
    { id: 'team_backoffice', name: 'Backoffice & Support', leaderId: 'u_broker_2' },
];

export const MOCK_USERS: User[] = [
    // SaaS Roles
    { id: 'u_saas_1', firstName: 'Admin', lastName: 'Global', email: 'admin@swissbroker-os.ch', role: UserRole.SAAS_SUPER_ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=saas' },
    { id: 'u_saas_2', firstName: 'Sarah', lastName: 'Sales', email: 'sales@swissbroker-os.ch', role: UserRole.SAAS_SALES },
    { id: 'u_saas_3', firstName: 'Frank', lastName: 'Finance', email: 'finance@swissbroker-os.ch', role: UserRole.SAAS_FINANCE },
    { id: 'u_saas_4', firstName: 'Alex', lastName: 'Acquisition', email: 'hunter@swissbroker-os.ch', role: UserRole.SAAS_ACQUISITION, avatarUrl: 'https://i.pravatar.cc/150?u=hunter' },
    
    // Broker Roles
    { 
        id: 'u_broker_1', 
        firstName: 'Max', 
        lastName: 'Muster', 
        email: 'max@muster-broker.ch', 
        role: UserRole.BROKER_ADMIN, 
        organizationName: 'Muster Broker AG', 
        tenantId: 't1', 
        teamId: 'team_mgmt', 
        position: 'CEO / Inhaber', 
        phone: '+41 79 123 45 67', 
        avatarUrl: 'https://i.pravatar.cc/150?u=max',
        modules: ['INSURANCE', 'MORTGAGE', 'PENSION', 'TAX'] 
    },
    { 
        id: 'u_broker_2', 
        firstName: 'Lisa', 
        lastName: 'Admin', 
        // FIXED: Added missing quotes around email address to prevent parsing error
        email: 'office@muster-broker.ch', 
        role: UserRole.BROKER_ADMINISTRATION, 
        organizationName: 'Muster Broker AG', 
        tenantId: 't1', 
        teamId: 'team_backoffice', 
        position: 'Leitung Administration', 
        phone: '+41 44 999 88 77',
        modules: ['INSURANCE', 'TAX']
    },
    { id: 'u_broker_3', firstName: 'Tom', lastName: 'Marketing', email: 'marketing@muster-broker.ch', role: UserRole.BROKER_MARKETING, organizationName: 'Muster Broker AG', tenantId: 't1', teamId: 'team_backoffice', position: 'Marketing Manager' },
    { id: 'u_agent_1', firstName: 'Felix', lastName: 'Fieldagent', email: 'felix@muster-broker.ch', role: UserRole.BROKER_AGENT, organizationName: 'Muster Broker AG', tenantId: 't1', teamId: 'team_sales', position: 'Senior Berater', phone: '+41 78 555 66 77', avatarUrl: 'https://i.pravatar.cc/150?u=felix', modules: ['INSURANCE', 'MORTGAGE', 'PENSION'] },
    { id: 'u_demo_solo', firstName: 'David', lastName: 'Demo (Solo)', email: 'david@solo-demo.ch', role: UserRole.BROKER_ADMIN, organizationName: 'David Consult', tenantId: 't_demo_1', avatarUrl: 'https://i.pravatar.cc/150?u=david' },
    { id: 'u_demo_corp', firstName: 'Julia', lastName: 'Demo (CEO)', email: 'julia@prime-finance.ch', role: UserRole.BROKER_ADMIN, organizationName: 'Prime Finance AG', tenantId: 't_demo_2', avatarUrl: 'https://i.pravatar.cc/150?u=julia' },
    { id: 'c1', firstName: 'Thomas', lastName: 'Müller', email: 'thomas.mueller@example.ch', role: UserRole.CLIENT, tenantId: 't1', avatarUrl: 'https://picsum.photos/id/1005/200/200' },
];

export const MOCK_TIME_ENTRIES: TimeEntry[] = [
    { id: 'te1', userId: 'u_agent_1', date: '2024-05-20', hours: 2.5, activity: 'Kundenberatung', description: 'Jahresgespräch und Vorsorgeanalyse', relatedClientId: 'c3' },
    { id: 'te2', userId: 'u_agent_1', date: '2024-05-20', hours: 1.0, activity: 'Reisezeit', description: 'Fahrt zu Kunde Bern' },
    { id: 'te3', userId: 'u_agent_1', date: '2024-05-21', hours: 4.0, activity: 'Administration', description: 'Offerten ausarbeiten Hypothek' },
    { id: 'te4', userId: 'u_broker_2', date: '2024-05-20', hours: 8.0, activity: 'Backoffice', description: 'Policenverarbeitung Batch' },
];

export const MOCK_TAX_SUMMARIES: TaxSummary[] = [
    { clientId: 'c1', year: 2023, deductiblePremiums: 4250, pillar3aContributions: 6883, debtInterest: 12400, medicalExpenses: 4000, status: 'COMPLETED' },
    { clientId: 'c3', year: 2023, deductiblePremiums: 3800, pillar3aContributions: 7056, debtInterest: 0, medicalExpenses: 1200, status: 'IN_PROGRESS' }
];

export const MOCK_TAX_RETURNS: TaxReturn[] = [
    { id: 'tax_c1_2023', clientId: 'c1', year: 2023, canton: 'Zürich', status: 'OPEN', deadline: '2024-09-30', assignedUserId: 'u_broker_2', documentsCount: 4, notes: 'Lohnausweis fehlt noch.', taxableIncome: 120000, deductionsTotal: 24500 },
    { id: 'tax_c2_2023', clientId: 'c2', year: 2023, canton: 'Luzern', status: 'DOCS_MISSING', deadline: '2024-08-31', assignedUserId: 'u_broker_2', documentsCount: 1, taxableIncome: 85000, deductionsTotal: 12000 },
    { id: 'tax_c3_2023', clientId: 'c3', year: 2023, canton: 'Bern', status: 'IN_PROGRESS', deadline: '2024-10-15', assignedUserId: 'u_broker_2', documentsCount: 8, notes: 'Fahrkostenabzug prüfen (Generalabo).', taxableIncome: 95000, deductionsTotal: 18000 },
    { id: 'tax_c1_2022', clientId: 'c1', year: 2022, canton: 'Zürich', status: 'ARCHIVED', deadline: '2023-09-30', documentsCount: 12, taxableIncome: 118000, deductionsTotal: 22000 }
];

export const MOCK_SAAS_PACKAGES: SaaSPackage[] = [
  { id: 'pkg_starter', name: 'Broker Starter', description: 'Perfekt für Einzelmakler, die digital starten wollen.', price: 99, billingCycle: 'MONTHLY', features: ['Bis zu 50 Klienten', 'Basis CRM & Policen', 'Kalender Integration', 'Email Support'], maxUsers: 1, supportLevel: 'EMAIL' },
  { id: 'pkg_pro', name: 'Professional', description: 'Für wachsende Teams mit Automatisierungsbedarf.', price: 249, billingCycle: 'MONTHLY', features: ['Bis zu 500 Klienten', 'Hypotheken-Rechner', 'Schnittstellen (Bexio, etc.)', 'Automatische Workflows', '3 Benutzer inklusive'], isPopular: true, maxUsers: 5, supportLevel: 'PRIORITY' },
  { id: 'pkg_enterprise', name: 'Enterprise', description: 'Maßgeschneiderte Lösung für grosse Organisationen.', price: 899, billingCycle: 'MONTHLY', features: ['Unlimitierte Klienten', 'White Labeling', 'API Zugriff', 'Dedizierter Success Manager', 'Unlimitierte Benutzer'], maxUsers: 999, supportLevel: 'DEDICATED' }
];

export const MOCK_TENANTS: Tenant[] = [
    { id: 't1', name: 'Muster Broker AG', plan: 'PROFESSIONAL', status: 'ACTIVE', usersCount: 3, mrr: 250, joinedDate: '2023-01-15', branding: { primaryColor: '#0ea5e9', logoText: 'Muster Broker' } },
    { id: 't2', name: 'Finanz & Partner GmbH', plan: 'ENTERPRISE', status: 'ACTIVE', usersCount: 12, mrr: 850, joinedDate: '2022-11-01', branding: { primaryColor: '#dc2626', logoText: 'F&P Finance' } },
    { id: 't3', name: 'Solo Broker Hans', plan: 'STARTER', status: 'TRIAL', usersCount: 1, mrr: 0, joinedDate: '2024-05-20', branding: { primaryColor: '#10b981', logoText: 'Hans Consult' } },
    { id: 't_demo_1', name: 'David Consult (Demo)', plan: 'STARTER', status: 'ACTIVE', usersCount: 1, mrr: 99, joinedDate: '2024-01-01', branding: { primaryColor: '#f59e0b', logoText: 'David Consult' } },
    { id: 't_demo_2', name: 'Prime Finance AG (Demo)', plan: 'ENTERPRISE', status: 'ACTIVE', usersCount: 25, mrr: 2500, joinedDate: '2023-06-01', branding: { primaryColor: '#7c3aed', logoText: 'Prime Finance' } },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', firstName: 'Thomas', lastName: 'Müller', email: 'thomas.mueller@example.ch', role: UserRole.CLIENT, address: 'Bahnhofstrasse 12', zipCity: '8001 Zürich', birthDate: '1980-05-15', advisorId: 'u_broker_1', taxDomicile: 'Zürich', avatarUrl: 'https://picsum.photos/id/1005/200/200' },
  { id: 'c2', firstName: 'Sarah', lastName: 'Keller', email: 'sarah.keller@example.ch', role: UserRole.CLIENT, address: 'Seestrasse 45', zipCity: '6000 Luzern', birthDate: '1992-11-20', advisorId: 'u_broker_1', taxDomicile: 'Luzern', avatarUrl: 'https://picsum.photos/id/1011/200/200' },
  { id: 'c3', firstName: 'Peter', lastName: 'Agenturkunden', email: 'peter.ag@example.ch', role: UserRole.CLIENT, address: 'Bergweg 3', zipCity: '3000 Bern', birthDate: '1985-02-10', advisorId: 'u_agent_1', taxDomicile: 'Bern', avatarUrl: 'https://picsum.photos/id/1025/200/200' }
];

export const MOCK_POLICIES: Policy[] = [
  { id: 'p1', clientId: 'c1', insurer: 'AXA', type: 'Privathaftpflicht', policyNumber: 'AX-992-883', startDate: '2023-01-01', endDate: '2028-01-01', premiumAmount: 145.50, premiumFrequency: 'YEARLY', status: PolicyStatus.ACTIVE, cancellationNoticePeriod: 3, deductible: 200, coverageDetails: ['Personenschäden', 'Sachschäden', 'Mieterschäden', 'Führen fremder Motorfahrzeuge'], initialCommission: 50.00, liabilityDurationMonths: 0 },
  { id: 'p2', clientId: 'c1', insurer: 'Zurich', type: 'Hausrat', policyNumber: 'ZH-221-332', startDate: '2022-06-01', endDate: '2027-06-01', premiumAmount: 320.00, premiumFrequency: 'YEARLY', status: PolicyStatus.ACTIVE, cancellationNoticePeriod: 3, deductible: 500, coverageDetails: ['Feuer', 'Wasser', 'Diebstahl zu Hause', 'Einfacher Diebstahl auswärts', 'Glasbruch Mobiliar'], initialCommission: 80.00, liabilityDurationMonths: 0 },
  { id: 'p3', clientId: 'c1', insurer: 'CSS', type: 'Krankenkasse (Grundversicherung)', policyNumber: 'CSS-KV-12', startDate: '2024-01-01', endDate: '2024-12-31', premiumAmount: 380.00, premiumFrequency: 'MONTHLY', status: PolicyStatus.ACTIVE, cancellationNoticePeriod: 1, deductible: 2500, coverageDetails: ['Standardmodell', 'Unfalldeckung eingeschlossen'], initialCommission: 100.00, liabilityDurationMonths: 12 },
  { id: 'p_risk_1', clientId: 'c1', insurer: 'Swiss Life', type: 'Lebensversicherung (Säule 3b)', policyNumber: 'SL-883-221', startDate: '2023-09-01', endDate: '2043-09-01', premiumAmount: 4000.00, premiumFrequency: 'YEARLY', status: PolicyStatus.ACTIVE, cancellationNoticePeriod: 3, initialCommission: 2500.00, liabilityDurationMonths: 36 },
  { id: 'p_risk_2', clientId: 'c2', insurer: 'Allianz', type: 'Rentenversicherung', policyNumber: 'AZ-772-119', startDate: '2024-01-01', endDate: '2050-01-01', premiumAmount: 6000.00, premiumFrequency: 'YEARLY', status: PolicyStatus.ACTIVE, cancellationNoticePeriod: 3, initialCommission: 3800.00, liabilityDurationMonths: 60 }
];

export const MOCK_DOCUMENTS: PolicyDocument[] = [
  { id: 'd1', policyId: 'p1', title: 'Versicherungspolice 2023', type: 'CONTRACT', date: '2023-01-05', size: '1.2 MB' },
  { id: 'd2', policyId: 'p1', title: 'Allgemeine Versicherungsbedingungen (AVB)', type: 'GENERAL_CONDITIONS', date: '2023-01-01', size: '450 KB' },
  { id: 'd3', policyId: 'p1', title: 'Prämienrechnung 2024', type: 'INVOICE', date: '2023-12-10', size: '120 KB' },
  { id: 'd4', policyId: 'p2', title: 'Police Hausrat', type: 'CONTRACT', date: '2022-06-01', size: '1.4 MB' },
];

export const MOCK_CLAIMS: Claim[] = [
  { id: 'cl1', policyId: 'p2', date: '2023-08-15', description: 'Wasserschaden Küche', status: 'CLOSED', amount: 1250 },
  { id: 'cl2', policyId: 'p1', date: '2024-02-10', description: 'Haftpflichtfall: Brillenschaden', status: 'PENDING', amount: 450 },
];

export const MOCK_ASSETS: Asset[] = [
  { id: 'a1', clientId: 'c1', name: 'UBS Konto Privat', type: AssetType.CASH, value: 45000, lastUpdated: '2024-05-20', provider: 'UBS' },
  { id: 'a2', clientId: 'c1', name: 'VIAC 3a Global', type: AssetType.PILLAR_3A, value: 62000, lastUpdated: '2024-05-19', provider: 'VIAC' },
  { id: 'a3', clientId: 'c1', name: 'Swisscanto BVG', type: AssetType.PENSION_FUND, value: 180000, lastUpdated: '2023-12-31', provider: 'Swisscanto' },
  { id: 'a4', clientId: 'c1', name: 'Eigentumswohnung Zürich', type: AssetType.REAL_ESTATE, value: 1250000, lastUpdated: '2024-01-01' },
];

export const MOCK_MORTGAGES: MortgageScenario[] = [
  { id: 'm1', clientId: 'c1', propertyName: 'Eigentumswohnung Zürich', propertyValue: 1250000, loanAmount: 800000, ownCapital: 450000, interestRate: 1.45, durationYears: 10, type: MortgageType.FIXED, monthlyCost: 966, startDate: '2020-07-01', endDate: '2030-07-01', amortizationMethod: 'INDIRECT' },
  { id: 'm2', clientId: 'c2', propertyName: 'Einfamilienhaus Luzern', propertyValue: 1800000, loanAmount: 1200000, ownCapital: 600000, interestRate: 1.85, durationYears: 5, type: MortgageType.SARON, monthlyCost: 1850, startDate: '2022-01-01', endDate: '2027-01-01', amortizationMethod: 'DIRECT' }
];

export const MOCK_ADVICE: AIAdvice[] = [
  { id: 'adv1', clientId: 'c1', category: 'RISK', title: 'Vorsorgelücke bei Erwerbsunfähigkeit', description: 'Basierend auf den aktuellen BVG-Daten besteht eine Deckungslücke von ca. CHF 24,000 p.a. bei Invalidität.', severity: 'HIGH', actionItem: 'Offerte für Erwerbsunfähigkeitsrente erstellen' },
  { id: 'adv2', clientId: 'c1', category: 'SAVING', title: 'Säule 3a Potenzial nicht ausgeschöpft', description: 'Für das Steuerjahr 2024 wurden bisher erst CHF 2,000 eingezahlt. Maximalbetrag: CHF 7,056.', severity: 'MEDIUM', actionItem: 'Einzahlungserinnerung senden' }
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int_ms_office', name: 'Microsoft 365 (Outlook)', description: 'Integration Ihrer geschäftlichen E-Mail-Adresse und Kalender.', category: IntegrationCategory.COMMUNICATION, status: IntegrationStatus.CONNECTED, iconUrl: 'MS', lastSync: 'Gerade eben', connectionType: 'OAUTH' },
  { id: 'int_google', name: 'Google Workspace', description: 'Verbinden Sie Gmail und Google Calendar für nahtlose Kommunikation.', category: IntegrationCategory.COMMUNICATION, status: IntegrationStatus.DISCONNECTED, iconUrl: 'G', lastSync: '-', connectionType: 'OAUTH' },
  { id: 'int_helvico', name: 'Helvico', description: 'Automatisierte Buchhaltung für Firmenkunden. Synchronisiert Debitoren und Prämienrechnungen.', category: IntegrationCategory.ACCOUNTING, status: IntegrationStatus.DISCONNECTED, iconUrl: 'H', lastSync: '-', connectionType: 'API_KEY' },
  { id: 'int_bexio', name: 'Bexio', description: 'Import von Kundenstammdaten und Export von Honorarnoten.', category: IntegrationCategory.ACCOUNTING, status: IntegrationStatus.CONNECTED, iconUrl: 'B', lastSync: 'Heute, 10:30', connectionType: 'OAUTH' },
  { id: 'int_finnova', name: 'Finnova Open Wealth', description: 'Direkte Anbindung an Bankdaten für die Vermögensübersicht.', category: IntegrationCategory.BANKING, status: IntegrationStatus.DISCONNECTED, iconUrl: 'F', lastSync: '-', connectionType: 'API_KEY' }
];

export const MOCK_PARTNERS: Partner[] = [
  { id: 'partner_axa', name: 'AXA Versicherungen', category: PartnerCategory.INSURANCE, status: PartnerStatus.ACTIVE, description: 'Führender Allbranchenversicherer in der Schweiz. Spezialisiert auf KMU und Berufliche Vorsorge.', website: 'https://www.axa.ch', brokerNumber: 'CH-88291-Broker', contacts: [ { name: 'Peter Muster', role: 'Key Account Manager', email: 'peter.muster@axa.ch', phone: '+41 58 215 00 00' }, { name: 'Support Broker', role: 'Administration', email: 'broker@axa.ch', phone: '+41 58 215 11 11' } ], products: [ { name: 'Berufliche Vorsorge (BVG)', category: 'Vorsorge', commissionRate: 'Bestand 2%', description: 'Vollversicherung und teilautonome Lösungen.' }, { name: 'Sachversicherungen KMU', category: 'Sach', commissionRate: 'Abschluss 15%', description: 'Kombinierte Sach- und Haftpflichtversicherung.' } ] },
  { id: 'partner_zurich', name: 'Zurich Insurance', category: PartnerCategory.INSURANCE, status: PartnerStatus.ACTIVE, description: 'Globaler Versicherer mit starken Schweizer Wurzeln. Innovativ im Bereich Cyber-Risk.', website: 'https://www.zurich.ch', brokerNumber: 'Z-99221-B', contacts: [ { name: 'Anna Müller', role: 'Broker Consultant', email: 'anna.mueller@zurich.ch', phone: '+41 44 628 00 00' } ], products: [ { name: 'Cyber & Data Risk', category: 'Haftpflicht', commissionRate: '15 - 20%', description: 'Umfassender Schutz vor Cyberkriminalität.' }, { name: 'Lebensversicherung', category: 'Leben', commissionRate: 'Abschluss 35‰', description: 'Risikoleben und Erwerbsunfähigkeit.' } ] },
  { id: 'partner_ubs', name: 'UBS Switzerland', category: PartnerCategory.BANK, status: PartnerStatus.PENDING, description: 'Grossbank für Hypothekenfinanzierung und Vermögensverwaltung.', website: 'https://www.ubs.com', brokerNumber: 'Pending', contacts: [ { name: 'Hypotheken Desk', role: 'Finanzierung', email: 'hypo@ubs.com', phone: '+41 44 234 11 11' } ], products: [ { name: 'Festhypotheken', category: 'Hypotheken', commissionRate: '0.3% Vermittlung', description: 'Langfristige Zinssicherheit.' }, { name: 'SARON Hypotheken', category: 'Hypotheken', commissionRate: '0.3% Vermittlung', description: 'Geldmarktbasierte Finanzierung.' } ] },
  { id: 'partner_legal', name: 'Kanzlei Meier & Partner', category: PartnerCategory.LEGAL, status: PartnerStatus.ACTIVE, description: 'Spezialisten für Versicherungsrecht und Vertragsprüfung.', website: 'https://meier-legal.ch', brokerNumber: 'N/A', contacts: [ { name: 'Dr. Hans Meier', role: 'Partner', email: 'h.meier@meier-legal.ch', phone: '+41 44 555 66 77' } ], products: [ { name: 'Rechtsberatung Mandanten', category: 'Recht', commissionRate: '10% Kickback', description: 'Prüfung komplexer Policen und Haftungsfragen.' } ] }
];

const today = new Date();
const addDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'evt1', title: 'Jahresgespräch Thomas Müller', start: addDays(1), end: addDays(1), type: EventType.MEETING, relatedId: 'c1', relatedType: RelatedEntityType.CLIENT, description: 'Überprüfung der Vorsorgesituation und Anpassung der Sachversicherung.', isAllDay: false },
  { id: 'evt2', title: 'Ablauf Police Hausrat Zurich', start: addDays(5), end: addDays(5), type: EventType.DEADLINE, relatedId: 'p2', relatedType: RelatedEntityType.POLICY, description: 'Kündigungsfrist beachten. Vergleichsofferte einholen.', isAllDay: true },
  { id: 'evt3', title: 'Hypothek Verlängerung Sarah Keller', start: addDays(10), end: addDays(10), type: EventType.TASK, relatedId: 'm2', relatedType: RelatedEntityType.MORTGAGE, description: 'Offerte für Festhypothek vorbereiten.', isAllDay: true },
  { id: 'evt4', title: 'Lunch mit AXA KAM', start: addDays(3), end: addDays(3), type: EventType.MEETING, relatedId: 'partner_axa', relatedType: RelatedEntityType.PARTNER, description: 'Besprechung neue BVG-Tarife 2025.', isAllDay: false },
  { id: 'evt5', title: 'Geburtstag Sarah Keller', start: new Date(today.getFullYear(), 10, 20), end: new Date(today.getFullYear(), 10, 20), type: EventType.BIRTHDAY, relatedId: 'c2', relatedType: RelatedEntityType.CLIENT, isAllDay: true },
  { id: 'evt6', title: 'Steuerauszug generieren', start: addDays(0), end: addDays(0), type: EventType.TASK, relatedId: 'c1', relatedType: RelatedEntityType.CLIENT, description: 'Für Steuererklärung 2023', isAllDay: true }
];

export const MOCK_COMMISSIONS: Commission[] = [
  { id: 'com1', date: '2024-05-15', amount: 1450.00, currency: 'CHF', type: CommissionType.ACQUISITION, status: CommissionStatus.PAID, source: 'Hypothek Sarah Keller', partnerName: 'UBS Switzerland', description: 'Vermittlungsprovision Festhypothek' },
  { id: 'com2', date: '2024-05-10', amount: 320.50, currency: 'CHF', type: CommissionType.RECURRING, status: CommissionStatus.PAID, source: 'Portfoliobestand Q1', partnerName: 'Zurich Insurance', description: 'Bestandscourtage Hausrat/Haftpflicht' },
  { id: 'com3', date: '2024-05-28', amount: 2500.00, currency: 'CHF', type: CommissionType.ACQUISITION, status: CommissionStatus.PENDING, source: 'BVG KMU Müller AG', partnerName: 'AXA Versicherungen', description: 'Abschlussprovision Vollversicherung' },
  { id: 'com4', date: '2024-04-30', amount: 180.00, currency: 'CHF', type: CommissionType.RECURRING, status: CommissionStatus.PAID, source: 'Bestand Auto', partnerName: 'Allianz', description: 'Jahrescourtage', agentId: 'u_agent_1', agentSplitPercentage: 0.6 },
  { id: 'com5', date: '2024-05-25', amount: 800.00, currency: 'CHF', type: CommissionType.ACQUISITION, status: CommissionStatus.PENDING, source: 'Lebensversicherung Peter A.', partnerName: 'Swiss Life', description: 'Abschlussprovision Säule 3a', agentId: 'u_agent_1', agentSplitPercentage: 0.7 },
];

export const MOCK_EMAILS: Email[] = [
    { id: 'e1', senderName: 'Sarah Keller', senderEmail: 'sarah.keller@example.ch', subject: 'Wasserschaden in der Küche - Meldung', preview: 'Guten Tag, leider habe ich heute morgen einen Wasserschaden in meiner Küche festgestellt. Der Geschirrspüler ist...', content: `<p>Guten Tag Herr Muster,</p><p>leider habe ich heute morgen einen Wasserschaden in meiner Küche festgestellt. Der Geschirrspüler ist undicht und das Parkett ist aufgequollen.</p><p>Ich habe bereits den Sanitär gerufen. Muss ich noch etwas tun?</p><p>Anbei finden Sie die Fotos.</p><br><p>Freundliche Grüsse,</p><p>Sarah Keller</p>`, date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15), isRead: false, folder: 'INBOX', relatedClientId: 'c2', attachments: [{ name: 'Schaden_Foto_1.jpg', type: 'image/jpeg' }, { name: 'Schaden_Foto_2.jpg', type: 'image/jpeg' }], source: 'OUTLOOK', priority: 'HIGH', tags: ['Schadenfall', 'Dringend'], category: 'CLAIMS' },
    { id: 'e2', senderName: 'Thomas Müller', senderEmail: 'thomas.mueller@example.ch', subject: 'Frage zum Jahresgespräch', preview: 'Hoi Max, können wir unseren Termin nächste Woche um eine Stunde verschieben? Mir ist etwas dazwischen gekommen...', content: `<p>Hoi Max,</p><p>können wir unseren Termin nächste Woche um eine Stunde verschieben? Mir ist etwas dazwischen gekommen.</p><p>15:00 Uhr statt 14:00 Uhr wäre super.</p><br><p>Gruss,</p><p>Thomas</p>`, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 14, 30), isRead: true, folder: 'INBOX', relatedClientId: 'c1', source: 'OUTLOOK', priority: 'NORMAL', tags: [], category: 'GENERAL' },
    { id: 'e3', senderName: 'Zurich Insurance Broker Support', senderEmail: 'broker.support@zurich.ch', subject: 'Bestätigung Policenänderung #ZH-221-332', preview: 'Sehr geehrter Partner, hiermit bestätigen wir die Anpassung der Hausratversicherung per 01.07.2024...', content: `<p>Sehr geehrter Partner,</p><p>hiermit bestätigen wir die Anpassung der Hausratversicherung per 01.07.2024.</p><p>Die neue Police wird Ihnen in den nächsten Tagen postalisch zugestellt.</p><br><p>Freundliche Grüsse,</p><p>Ihr Zurich Broker Team</p>`, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 0), isRead: true, folder: 'INBOX', relatedClientId: 'c1', relatedPolicyId: 'p2', source: 'GMAIL', priority: 'LOW', tags: ['Police', 'Admin'], category: 'ADMIN' }
];
