import { 
  AssetType, Client, MortgageType, Policy, PolicyStatus, UserRole, 
  AIAdvice, Asset, MortgageScenario, Integration, IntegrationCategory, 
  IntegrationStatus, PolicyDocument, Claim, Partner, PartnerCategory, 
  PartnerStatus, CalendarEvent, EventType, RelatedEntityType, Commission, 
  CommissionType, CommissionStatus, User, Tenant, SaaSPackage, Email, 
  Team, TimeEntry, TaxSummary, TaxReturn, Testimonial, BankOffer, CreditType, 
  StaticPage, MegaMenuCategory, SaaSAddon, ClientNote, ActivityLog, LeadOffer 
} from './types';

export const APP_NAME = "SwissBroker OS";

export const MOCK_USERS: User[] = [
  {
    id: 'u_broker_1',
    username: 'max_broker',
    email: 'max.muster@swissbroker.ch',
    firstName: 'Max',
    lastName: 'Muster',
    role: UserRole.BROKER_ADMIN,
    organizationName: 'Muster Broker AG',
    avatarUrl: 'https://ui-avatars.com/api/?name=Max+Muster',
    tenantId: 't1'
  },
  {
    id: 'u_broker_2',
    username: 'maria_admin',
    email: 'maria.admin@swissbroker.ch',
    firstName: 'Maria',
    lastName: 'Admina',
    role: UserRole.BROKER_ADMINISTRATION,
    organizationName: 'Muster Broker AG',
    avatarUrl: 'https://ui-avatars.com/api/?name=Maria+Admina',
    tenantId: 't1',
    teamId: 'team_backoffice'
  },
  {
    id: 'u_client_1',
    username: 'hans_meier',
    email: 'hans.meier@example.com',
    firstName: 'Hans',
    lastName: 'Meier',
    role: UserRole.CLIENT,
    avatarUrl: 'https://ui-avatars.com/api/?name=Hans+Meier',
    tenantId: 't1'
  },
  {
    id: 'u_saas_admin',
    username: 'admin_global',
    email: 'admin@swissbroker-os.ch',
    firstName: 'Admin',
    lastName: 'Global',
    role: UserRole.SAAS_SUPER_ADMIN,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Global'
  },
  {
    id: 'u_agent_1',
    username: 'felix_agent',
    email: 'felix.field@swissbroker.ch',
    firstName: 'Felix',
    lastName: 'Fieldagent',
    role: UserRole.BROKER_AGENT,
    organizationName: 'Muster Broker AG',
    avatarUrl: 'https://ui-avatars.com/api/?name=Felix+Fieldagent',
    tenantId: 't1',
    teamId: 'team_sales',
    modules: ['INSURANCE', 'MORTGAGE']
  },
  {
    id: 'u_test_agent',
    username: 'test_agent',
    email: 'test.agent@swissbroker.ch',
    firstName: 'Test',
    lastName: 'Agent',
    role: UserRole.BROKER_AGENT,
    organizationName: 'Muster Broker AG',
    avatarUrl: 'https://ui-avatars.com/api/?name=Test+Agent',
    tenantId: 't1',
    teamId: 'team_sales'
  },
  {
    id: 'u_saas_4',
    username: 'alex_hunter',
    email: 'alex.hunter@swissbroker-os.ch',
    firstName: 'Alex',
    lastName: 'Acquisition',
    role: UserRole.SAAS_ACQUISITION,
    avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Acquisition'
  },
  {
      id: 'u_demo_solo',
      username: 'solo_hans',
      email: 'hans@solo-broker.ch',
      firstName: 'Hans',
      lastName: 'Solo',
      role: UserRole.BROKER_ADMIN,
      organizationName: 'Solo Broker Hans',
      avatarUrl: 'https://ui-avatars.com/api/?name=Hans+Solo',
      tenantId: 't3'
  },
  {
      id: 'u_demo_corp',
      username: 'corp_admin',
      email: 'admin@finanz-partner.ch',
      firstName: 'Cornelia',
      lastName: 'Corp',
      role: UserRole.BROKER_ADMIN,
      organizationName: 'Finanz & Partner GmbH',
      avatarUrl: 'https://ui-avatars.com/api/?name=Cornelia+Corp',
      tenantId: 't2'
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    username: 'hans_meier',
    email: 'hans.meier@example.com',
    firstName: 'Hans',
    lastName: 'Meier',
    role: UserRole.CLIENT,
    address: 'Bahnhofstrasse 1',
    zipCity: '8001 Zürich',
    birthDate: '15.04.1980',
    advisorId: 'u_broker_1',
    taxDomicile: 'Zürich',
    avatarUrl: 'https://ui-avatars.com/api/?name=Hans+Meier',
    tenantId: 't1',
    companyName: 'Meier Consulting AG',
    trustScore: {
        score: 95,
        level: 'HIGH',
        lastUpdated: '2024-06-01',
        checks: [
            { id: 'k1', checkName: 'Zefix Validation', status: 'PASSED', lastChecked: '2024-06-01', details: 'Firma aktiv, UID: CHE-123.456.789' },
            { id: 'k2', checkName: 'Sanktionslisten (SECO)', status: 'PASSED', lastChecked: '2024-06-01' },
            { id: 'k3', checkName: 'Plausibilität (Einkommen)', status: 'PASSED', lastChecked: '2024-05-15', details: 'Vermögen passt zu Einkommen.' }
        ]
    }
  },
  {
    id: 'c2',
    username: 'anna_schmidt',
    email: 'anna.schmidt@example.com',
    firstName: 'Anna',
    lastName: 'Schmidt',
    role: UserRole.CLIENT,
    address: 'Seestrasse 45',
    zipCity: '8800 Thalwil',
    birthDate: '22.11.1985',
    advisorId: 'u_broker_1',
    taxDomicile: 'Zürich',
    avatarUrl: 'https://ui-avatars.com/api/?name=Anna+Schmidt',
    tenantId: 't1',
    trustScore: {
        score: 75,
        level: 'MEDIUM',
        lastUpdated: '2024-05-20',
        checks: [
            { id: 'k4', checkName: 'Identitätsprüfung', status: 'PASSED', lastChecked: '2024-01-10' },
            { id: 'k5', checkName: 'Adressvalidierung', status: 'WARNING', lastChecked: '2024-05-20', details: 'Postzustellung einmal fehlgeschlagen.' }
        ]
    }
  },
  {
    id: 'c3',
    username: 'peter_mueller',
    email: 'peter.mueller@example.com',
    firstName: 'Peter',
    lastName: 'Müller',
    role: UserRole.CLIENT,
    address: 'Dorfplatz 3',
    zipCity: '3000 Bern',
    birthDate: '03.07.1975',
    advisorId: 'u_agent_1',
    taxDomicile: 'Bern',
    avatarUrl: 'https://ui-avatars.com/api/?name=Peter+Müller',
    tenantId: 't1'
  }
];

export const MOCK_POLICIES: Policy[] = [
  {
    id: 'p1',
    clientId: 'c1',
    insurer: 'AXA',
    type: 'Privathaftpflicht',
    policyNumber: '83.223.442',
    startDate: '01.01.2023',
    endDate: '01.01.2024',
    premiumAmount: 145.00,
    premiumFrequency: 'Jährlich',
    status: PolicyStatus.ACTIVE,
    cancellationNoticePeriod: 3,
    deductible: 200,
    coverageDetails: ['Privathaftpflicht', 'Grobfahrlässigkeit'],
    initialCommission: 50,
    liabilityDurationMonths: 0,
    marketBenchmarkDelta: -12, // 12% cheaper than market
    contractFlags: []
  },
  {
    id: 'p2',
    clientId: 'c1',
    insurer: 'Zurich',
    type: 'Motorfahrzeug',
    policyNumber: 'M-992-883',
    startDate: '15.03.2023',
    endDate: '15.03.2024',
    premiumAmount: 850.00,
    premiumFrequency: 'Jährlich',
    status: PolicyStatus.ACTIVE,
    cancellationNoticePeriod: 1,
    deductible: 500,
    coverageDetails: ['Vollkasko', 'Parkschaden'],
    initialCommission: 150,
    liabilityDurationMonths: 0,
    marketBenchmarkDelta: 5, // 5% more expensive
    contractFlags: ['Selbstbehalt Junglenker: CHF 1000']
  },
  {
    id: 'p3',
    clientId: 'c2',
    insurer: 'Allianz',
    type: 'Hausrat',
    policyNumber: 'H-123-456',
    startDate: '01.06.2022',
    endDate: '01.06.2027',
    premiumAmount: 320.00,
    premiumFrequency: 'Jährlich',
    status: PolicyStatus.ACTIVE,
    cancellationNoticePeriod: 3,
    initialCommission: 800,
    liabilityDurationMonths: 60,
    marketBenchmarkDelta: 0,
    contractFlags: ['Laufzeit: 5 Jahre (Ungewöhnlich lang)']
  }
];

export const MOCK_ASSETS: Asset[] = [
  { id: 'a1', clientId: 'c1', name: 'ZKB Privatkonto', type: AssetType.CASH, value: 45000, lastUpdated: '2024-05-01', provider: 'ZKB' },
  { id: 'a2', clientId: 'c1', name: 'VIAC 3a', type: AssetType.PILLAR_3A, value: 65000, lastUpdated: '2024-05-01', provider: 'VIAC' },
  { id: 'a3', clientId: 'c1', name: 'Eigentumswohnung', type: AssetType.REAL_ESTATE, value: 1200000, lastUpdated: '2023-12-31' },
  { id: 'a4', clientId: 'c1', name: 'Swisscanto Fonds', type: AssetType.SECURITIES, value: 25000, lastUpdated: '2024-05-15', provider: 'ZKB' },
];

export const MOCK_ADVICE: AIAdvice[] = [
  { id: 'adv1', clientId: 'c1', category: 'RISK', title: 'Unterversicherung Hausrat', description: 'Die Versicherungssumme scheint im Vergleich zum geschätzten Vermögen zu tief.', severity: 'MEDIUM', actionItem: 'Summe anpassen' },
  { id: 'adv2', clientId: 'c1', category: 'SAVING', title: 'Säule 3a nicht ausgeschöpft', description: 'Für das Jahr 2023 wurde das Maximum noch nicht einbezahlt. Steuerersparnis möglich.', severity: 'HIGH', actionItem: 'Einzahlung erinnern' },
];

export const MOCK_MORTGAGES: MortgageScenario[] = [
  {
    id: 'm1',
    clientId: 'c1',
    propertyName: 'Eigentumswohnung Zürich',
    propertyValue: 1200000,
    loanAmount: 800000,
    ownCapital: 400000,
    interestRate: 1.85,
    durationYears: 10,
    type: MortgageType.FIXED,
    monthlyCost: 1233,
    startDate: '01.07.2020',
    endDate: '01.07.2030',
    amortizationMethod: 'INDIRECT',
    applicationStatus: 'APPROVED'
  }
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int1', name: 'Bexio', description: 'Buchhaltung & Kontakte synchronisieren.', category: IntegrationCategory.ACCOUNTING, status: IntegrationStatus.CONNECTED, iconUrl: 'B', lastSync: 'Gerade eben', connectionType: 'OAUTH' },
  { id: 'int2', name: 'Abacus', description: 'Enterprise ERP Anbindung.', category: IntegrationCategory.ACCOUNTING, status: IntegrationStatus.DISCONNECTED, iconUrl: 'A', lastSync: '-', connectionType: 'API_KEY' },
  { id: 'int3', name: 'Microsoft 365', description: 'E-Mail & Kalender Sync.', category: IntegrationCategory.COMMUNICATION, status: IntegrationStatus.CONNECTED, iconUrl: 'M', lastSync: 'Vor 1 Std', connectionType: 'OAUTH' },
];

export const MOCK_DOCUMENTS: PolicyDocument[] = [
  { id: 'd1', policyId: 'p1', title: 'Police 2024', type: 'PDF', date: '01.01.2024', size: '1.2 MB' },
  { id: 'd2', policyId: 'p1', title: 'AVB Ausgabe 2022', type: 'PDF', date: '01.01.2022', size: '0.8 MB' },
];

export const MOCK_CLAIMS: Claim[] = [
  { id: 'cl1', policyId: 'p2', date: '12.02.2024', description: 'Parkschaden Stossstange', status: 'PENDING', amount: 1200 },
];

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'part1',
    name: 'AXA',
    category: PartnerCategory.INSURANCE,
    status: PartnerStatus.ACTIVE,
    description: 'Allbranchen-Versicherer',
    website: 'https://www.axa.ch',
    brokerNumber: '12345-AX',
    contacts: [{ name: 'Hans Muster', role: 'Broker Betreuer', email: 'hans.muster@axa.ch', phone: '+41 58 123 45 67' }],
    products: [{ name: 'Privathaftpflicht', category: 'Sach', commissionRate: '15%', description: 'Standard Deckung' }]
  },
  {
    id: 'part2',
    name: 'Zürcher Kantonalbank',
    category: PartnerCategory.BANK,
    status: PartnerStatus.ACTIVE,
    description: 'Hypotheken Partner',
    website: 'https://www.zkb.ch',
    brokerNumber: 'ZKB-9988',
    contacts: [],
    products: []
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Jahresgespräch Hans Meier', start: new Date(new Date().setDate(new Date().getDate() + 2)), end: new Date(new Date().setDate(new Date().getDate() + 2)), type: EventType.MEETING, relatedId: 'c1', relatedType: RelatedEntityType.CLIENT, isAllDay: false },
  { id: 'e2', title: 'Ablauf Police P1', start: new Date('2024-01-01'), end: new Date('2024-01-01'), type: EventType.DEADLINE, relatedId: 'p1', relatedType: RelatedEntityType.POLICY, isAllDay: true },
];

export const MOCK_COMMISSIONS: Commission[] = [
  { id: 'com1', date: '2024-05-01', amount: 150.00, currency: 'CHF', type: CommissionType.ACQUISITION, status: CommissionStatus.PAID, source: 'AXA', partnerName: 'AXA', description: 'Abschluss PH', agentId: 'u_agent_1', agentSplitPercentage: 0.5 },
  { id: 'com2', date: '2024-05-15', amount: 450.00, currency: 'CHF', type: CommissionType.RECURRING, status: CommissionStatus.PENDING, source: 'Zurich', partnerName: 'Zurich', description: 'Bestand Auto', agentId: 'u_agent_1', agentSplitPercentage: 0.5 },
];

export const MOCK_EMAILS: Email[] = [
    { id: 'em1', senderName: 'Hans Meier', senderEmail: 'hans.meier@example.com', subject: 'Frage zur Police', preview: 'Guten Tag, ich habe eine Frage zur Rechnung...', content: 'Guten Tag,<br/>ich habe eine Frage zur Rechnung vom 01.05.2024. Können wir dazu telefonieren?<br/>Gruss Hans', date: new Date('2024-05-20T10:00:00'), isRead: false, folder: 'INBOX', source: 'Gmail', priority: 'NORMAL', tags: ['Kunde'], category: 'Service' },
    { id: 'em2', senderName: 'AXA Broker Service', senderEmail: 'broker@axa.ch', subject: 'Neue Dokumente verfügbar', preview: 'Im Partnerportal stehen neue Dokumente bereit.', content: 'Sehr geehrte Damen und Herren,<br/>neue Dokumente verfügbar.', date: new Date('2024-05-19T14:30:00'), isRead: true, folder: 'INBOX', source: 'Outlook', priority: 'NORMAL', tags: ['Partner', 'Dokumente'], category: 'Admin' },
];

export const MOCK_TEAMS: Team[] = [
    { id: 'team_sales', name: 'Sales & Beratung', description: 'Kundenbetreuung und Akquise', leaderId: 'u_broker_1' },
    { id: 'team_backoffice', name: 'Backoffice', description: 'Administration und Policenverwaltung', leaderId: 'u_broker_2' }
];

export const MOCK_TIME_ENTRIES: TimeEntry[] = [
    { id: 'te1', userId: 'u_agent_1', date: '2024-05-20', hours: 2.5, activity: 'Kundenberatung', description: 'Jahresgespräch und Vorsorgeanalyse', relatedClientId: 'c3', status: 'APPROVED' },
    { id: 'te2', userId: 'u_agent_1', date: '2024-05-20', hours: 1.0, activity: 'Reisezeit', description: 'Fahrt zu Kunde Bern', status: 'APPROVED' },
    { id: 'te3', userId: 'u_agent_1', date: '2024-05-21', hours: 4.0, activity: 'Administration', description: 'Offerten ausarbeiten Hypothek', status: 'SUBMITTED' },
    { id: 'te4', userId: 'u_broker_2', date: '2024-05-20', hours: 8.0, activity: 'Backoffice', description: 'Policenverarbeitung Batch', status: 'DRAFT' },
    { id: 'te5', userId: 'u_test_agent', date: '2024-06-03', hours: 3.0, activity: 'Kundenberatung', description: 'Erstgespräch', status: 'DRAFT' },
    { id: 'te6', userId: 'u_test_agent', date: '2024-06-03', hours: 1.5, activity: 'Administration', description: 'CRM Pflege', status: 'SUBMITTED' },
];

export const MOCK_TENANTS: Tenant[] = [
    { 
        id: 't1', 
        name: 'Muster Broker AG', 
        plan: 'PROFESSIONAL', 
        status: 'ACTIVE', 
        usersCount: 3, 
        mrr: 250, 
        joinedDate: '2023-01-15', 
        branding: { primaryColor: '#0ea5e9', logoText: 'Muster Broker' }, 
        activeAddons: [],
        hrConfig: { requireTimeSubmission: true, requireTimeApproval: true, workWeekHours: 42 },
        complianceStats: { finmaStatus: 'REGISTERED', ciceroNumber: '12345', churnRisk: 'LOW' }
    },
    { 
        id: 't2', 
        name: 'Finanz & Partner GmbH', 
        plan: 'ENTERPRISE', 
        status: 'ACTIVE', 
        usersCount: 12, 
        mrr: 850, 
        joinedDate: '2022-11-01', 
        branding: { primaryColor: '#dc2626', logoText: 'F&P Finance' }, 
        activeAddons: ['addon_website'],
        hrConfig: { requireTimeSubmission: false, requireTimeApproval: false, workWeekHours: 40 },
        complianceStats: { finmaStatus: 'REGISTERED', ciceroNumber: '99887', churnRisk: 'MEDIUM' }
    },
    { 
        id: 't3', 
        name: 'Solo Broker Hans', 
        plan: 'STARTER', 
        status: 'TRIAL', 
        usersCount: 1, 
        mrr: 0, 
        joinedDate: '2024-05-20', 
        branding: { primaryColor: '#10b981', logoText: 'Hans Consult' }, 
        activeAddons: [],
        hrConfig: { requireTimeSubmission: false, requireTimeApproval: false, workWeekHours: 42 },
        complianceStats: { finmaStatus: 'WARNING', churnRisk: 'HIGH' } // Warning example
    },
    { id: 't_demo_1', name: 'David Consult (Demo)', plan: 'STARTER', status: 'ACTIVE', usersCount: 1, mrr: 128, joinedDate: '2024-01-01', branding: { primaryColor: '#f59e0b', logoText: 'David Consult' }, activeAddons: ['addon_website'], complianceStats: { finmaStatus: 'REGISTERED', churnRisk: 'LOW' } },
    { id: 't_demo_2', name: 'Prime Finance AG (Demo)', plan: 'ENTERPRISE', status: 'ACTIVE', usersCount: 25, mrr: 2500, joinedDate: '2023-06-01', branding: { primaryColor: '#7c3aed', logoText: 'Prime Finance' }, activeAddons: ['addon_website'], complianceStats: { finmaStatus: 'REGISTERED', churnRisk: 'LOW' } },
];

export const MOCK_TAX_SUMMARIES: TaxSummary[] = [
    { clientId: 'c1', year: 2023, deductiblePremiums: 4250, pillar3aContributions: 6883, debtInterest: 12400, medicalExpenses: 4000, status: 'READY' }
];

export const MOCK_TAX_RETURNS: TaxReturn[] = [
    { id: 'tr1', clientId: 'c1', year: 2023, canton: 'Zürich', status: 'IN_PROGRESS', deadline: '30.09.2024', documentsCount: 5, taxableIncome: 125000, deductionsTotal: 27533 },
    { id: 'tr2', clientId: 'c2', year: 2023, canton: 'Zürich', status: 'OPEN', deadline: '31.03.2024', documentsCount: 0, taxableIncome: 95000, deductionsTotal: 12000 },
];

export const MOCK_ADDONS: SaaSAddon[] = [
    { id: 'addon_website', name: 'Web-Engine & SEO', description: 'Professionelle Makler-Webseite mit Lead-Gen Formularen.', price: 29, iconName: 'Layout' },
    { id: 'addon_ai_pro', name: 'AI Risk Analyst Pro', description: 'Unlimitierte Analysen von Policen und Verträgen.', price: 49, iconName: 'BrainCircuit' },
    { id: 'addon_branding', name: 'Custom Branding', description: 'White-Labeling für das Kundenportal.', price: 19, iconName: 'Palette' },
];

export const MOCK_SAAS_PACKAGES: SaaSPackage[] = [
    { id: 'pkg_starter', name: 'Starter', description: 'Für Einzelkämpfer', price: 99, billingCycle: 'MONTHLY', features: ['CRM Basis', '50 Kunden', 'Standard Support'], maxUsers: 1, supportLevel: 'Email', includedAddons: [] },
    { id: 'pkg_pro', name: 'Professional', description: 'Für wachsende Büros', price: 249, billingCycle: 'MONTHLY', features: ['CRM Pro', 'Unlimitiert Kunden', 'Hypotheken Rechner', 'Teams', 'Arbeitsrapport & HR'], maxUsers: 5, supportLevel: 'Priority', includedAddons: [], isPopular: true },
    { id: 'pkg_enterprise', name: 'Enterprise', description: 'Für Organisationen', price: 899, billingCycle: 'MONTHLY', features: ['Alles in Pro', 'API Zugriff', 'SLA', 'Custom Domain', 'Arbeitsrapport & HR'], maxUsers: 25, supportLevel: '24/7 Phone', includedAddons: ['addon_branding'] },
];

export const MOCK_BANK_OFFERS: BankOffer[] = [
    { id: 'bo1', bankName: 'Bank-now', productName: 'Privatkredit', interestRateRange: [4.5, 9.9], maxDuration: 84, commissionPercentage: 2.0, type: CreditType.PRIVATE },
    { id: 'bo2', bankName: 'Cembra', productName: 'Finanzierung Plus', interestRateRange: [5.9, 9.9], maxDuration: 60, commissionPercentage: 2.5, type: CreditType.PRIVATE },
    { id: 'bo3', bankName: 'AMAG Leasing', productName: 'Leasing', interestRateRange: [3.9, 5.9], maxDuration: 60, commissionPercentage: 1.5, type: CreditType.LEASING },
    { id: 'bo4', bankName: 'Gowago', productName: 'All-in-One', interestRateRange: [4.2, 6.5], maxDuration: 48, commissionPercentage: 2.0, type: CreditType.LEASING },
];

// --- UPDATED STATIC PAGES WITH CONTENT FOR CMS ---
export const MOCK_STATIC_PAGES: StaticPage[] = [
    { 
        id: 'p_imprint', 
        slug: 'impressum', 
        isPublished: true, 
        lastUpdated: '01.01.2024', 
        title: { de: 'Impressum', en: 'Imprint', fr: 'Empreinte', it: 'Impronta' }, 
        content: { de: '<h1>Impressum</h1><p>Angaben gemäss...</p>', en: '<h1>Imprint</h1>', fr: '<h1>Empreinte</h1>', it: '<h1>Impronta</h1>' } 
    },
    { 
        id: 'p_privacy', 
        slug: 'datenschutz', 
        isPublished: true, 
        lastUpdated: '01.01.2024', 
        title: { de: 'Datenschutz', en: 'Privacy', fr: 'Confidentialité', it: 'Privacy' }, 
        content: { de: '<h1>Datenschutz</h1><p>Wir nehmen...</p>', en: '<h1>Privacy</h1>', fr: '<h1>Confidentialité</h1>', it: '<h1>Privacy</h1>' } 
    },
    { 
        id: 'p_contact', 
        slug: 'contact', 
        isPublished: true, 
        lastUpdated: '01.06.2024', 
        title: { de: 'Kontakt', en: 'Contact', fr: 'Contact', it: 'Contatto' }, 
        content: { 
            de: `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
                    <div>
                        <h2 class="text-3xl font-black mb-6 tracking-tight">Sprechen wir über Ihre Zukunft.</h2>
                        <p class="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            Ob Sie eine Frage zu unseren Funktionen haben, eine Partnerschaft anstreben oder einfach nur "Hallo" sagen wollen – wir sind für Sie da.
                        </p>
                        
                        <div class="space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-900 dark:text-white">Rufen Sie uns an</h4>
                                    <p class="text-sm text-slate-500 mb-1">Mo-Fr von 8:00 bis 18:00 Uhr</p>
                                    <a href="tel:+41441234567" class="text-blue-600 font-bold hover:underline">+41 44 123 45 67</a>
                                </div>
                            </div>

                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-900 dark:text-white">Schreiben Sie uns</h4>
                                    <p class="text-sm text-slate-500 mb-1">Unser Team antwortet in der Regel innerhalb von 2 Stunden.</p>
                                    <a href="mailto:support@swissbroker-os.ch" class="text-emerald-600 font-bold hover:underline">support@swissbroker-os.ch</a>
                                </div>
                            </div>

                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-900 dark:text-white">Besuchen Sie uns</h4>
                                    <p class="text-sm text-slate-500 mb-1">Hauptsitz Zürich</p>
                                    <p class="font-medium text-slate-700 dark:text-slate-300">Bahnhofstrasse 1<br/>8001 Zürich, Schweiz</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        <div class="mb-6">
                            <span class="text-xs font-black uppercase text-brand-600 tracking-widest">Support & Sales</span>
                            <h3 class="text-2xl font-bold mt-2">Wie können wir helfen?</h3>
                        </div>
                        <p class="text-sm text-slate-500 mb-8">
                            Starten Sie den interaktiven Kontakt-Assistenten, um Ihr Anliegen direkt an die richtige Abteilung zu leiten.
                        </p>
                        <!-- Button will be injected via React Portal logic in PublicPage.tsx -->
                        <div id="contact-wizard-container"></div>
                    </div>
                </div>
            `, 
            en: '<h1>Contact Us</h1><p>We are here for you.</p>', 
            fr: '<h1>Contact</h1>', 
            it: '<h1>Contatto</h1>' 
        } 
    },
    { 
        id: 'p_about', 
        slug: 'about', 
        isPublished: true, 
        lastUpdated: '01.06.2024', 
        title: { de: 'Über uns', en: 'About us', fr: 'À propos', it: 'Chi siamo' }, 
        content: { 
            de: '<h1>Über SwissBroker OS</h1><p>Wir sind das Betriebssystem für den modernen Schweizer Finanzmarkt. Unsere Mission ist es, Brokern durch Technologie den Rücken freizuhalten.</p><h2>Unsere Werte</h2><ul><li>Innovation</li><li>Sicherheit (Swiss Made)</li><li>Unabhängigkeit</li></ul>', 
            en: '<h1>About SwissBroker OS</h1>', 
            fr: '<h1>À propos</h1>', 
            it: '<h1>Chi siamo</h1>' 
        } 
    },
    { 
        id: 'sol_broker', 
        slug: 'solutions-broker', 
        isPublished: true, 
        lastUpdated: '01.06.2024', 
        title: { de: 'Lösung für Einzelmakler', en: 'For Brokers', fr: 'Courtiers', it: 'Broker' }, 
        content: { 
            de: '<h1>Effizienz für Einzelkämpfer</h1><p>Als Einzelmakler zählt jede Minute. SwissBroker OS automatisiert Ihre Administration, damit Sie mehr Zeit für Ihre Kunden haben.</p><h2>Features</h2><ul><li>Mobiles Büro</li><li>Automatisierte Termine</li><li>Digitaler Kundenordner</li></ul>', 
            en: '<h1>For Brokers</h1>', 
            fr: '<h1>Courtiers</h1>', 
            it: '<h1>Broker</h1>' 
        } 
    },
    { 
        id: 'sol_enterprise', 
        slug: 'solutions-enterprise', 
        isPublished: true, 
        lastUpdated: '01.06.2024', 
        title: { de: 'Für Grossbetriebe', en: 'Enterprise', fr: 'Entreprise', it: 'Impresa' }, 
        content: { 
            de: '<h1>Skalierbarkeit & Compliance</h1><p>Managen Sie grosse Teams mit komplexen Hierarchien. Unsere Enterprise-Features decken HR, Abrechnung und Compliance ab.</p>', 
            en: '<h1>Enterprise</h1>', 
            fr: '<h1>Entreprise</h1>', 
            it: '<h1>Impresa</h1>' 
        } 
    },
    { 
        id: 'sol_sales', 
        slug: 'solutions-sales', 
        isPublished: true, 
        lastUpdated: '01.06.2024', 
        title: { de: 'Für Vertriebe', en: 'Sales Orgs', fr: 'Ventes', it: 'Vendite' }, 
        content: { 
            de: '<h1>Lead-Management & Provisionen</h1><p>Optimieren Sie Ihren Vertriebstrichter und rechnen Sie Provisionen transparent ab.</p>', 
            en: '<h1>Sales Orgs</h1>', 
            fr: '<h1>Ventes</h1>', 
            it: '<h1>Vendite</h1>' 
        } 
    }
];

export const MOCK_NAVIGATION: MegaMenuCategory[] = [
    {
        id: 'nav_product',
        title: 'Produkt',
        links: [
            { id: 'l1', title: 'CRM & Portfolio', description: 'Kundenverwaltung & Policen', path: '/features/crm', iconName: 'Users' },
            { id: 'l2', title: 'Hypotheken', description: 'Finanzierungs-Rechner', path: '/features/mortgage-calc', iconName: 'Calculator' },
            { id: 'l3', title: 'KI Risk Radar', description: 'Automatische Risikoanalyse', path: '/features/ai-risk', iconName: 'BrainCircuit' },
            { id: 'l_tax', title: 'Steuer-Cockpit', description: 'Optimierung & Simulation', path: '/features/tax-module', iconName: 'FileText' },
            { id: 'l_app', title: 'Kunden App', description: 'White-Label Mobile App', path: '/features/client-portal', iconName: 'Smartphone' },
        ]
    },
    {
        id: 'nav_solutions',
        title: 'Lösungen',
        links: [
            { id: 'l4', title: 'Für Einzelmakler', description: 'Effizienz für One-Man-Shows', path: '/p/solutions-broker', iconName: 'User' },
            { id: 'l5', title: 'Für Grossbetriebe', description: 'Teams, Hierarchien & HR', path: '/p/solutions-enterprise', iconName: 'Building2' },
            { id: 'l6', title: 'Für Vertriebe', description: 'Strukturvertrieb & Leads', path: '/p/solutions-sales', iconName: 'TrendingUp' },
        ]
    },
    {
        id: 'nav_prices',
        title: 'Preise',
        links: [
            { id: 'p1', title: 'Pakete & Preise', description: 'Starter bis Enterprise', path: '/public/plans', iconName: 'DollarSign' },
            { id: 'p2', title: 'Add-ons', description: 'Modulare Erweiterungen', path: '/public/plans#addons', iconName: 'Zap' },
        ]
    },
    {
        id: 'nav_resources',
        title: 'Ressourcen',
        links: [
            { id: 'r1', title: 'Blog & News', description: 'Aktuelles aus der Branche', path: '/public/blog', iconName: 'BookOpen' },
            { id: 'r2', title: 'Success Stories', description: 'Erfolgsgeschichten', path: '/public/success-stories', iconName: 'Award' },
            { id: 'r3', title: 'Hilfe Center', description: 'Anleitungen & Support', path: '/faq', iconName: 'HelpCircle' },
            { id: 'r4', title: 'Partner werden', description: 'Affiliate Programm', path: '/affiliate', iconName: 'Handshake' },
        ]
    },
    {
        id: 'nav_company',
        title: 'Unternehmen',
        links: [
            { id: 'c1', title: 'Über uns', description: 'Unsere Mission & Werte', path: '/p/about', iconName: 'Info' },
            { id: 'c2', title: 'Karriere', description: 'Wir stellen ein!', path: '/career', iconName: 'Briefcase' },
            { id: 'c3', title: 'Kontakt', description: 'Sprechen Sie mit uns', path: '/p/contact', iconName: 'Mail' },
        ]
    }
];

export const FAQS = [
  {
    category: "Allgemein",
    question: "Was ist SwissBroker OS?",
    answer: "Es ist das erste ganzheitliche Betriebssystem für Schweizer Broker, das CRM, HR, KI-Akquise und Finanz-Simulationen in einer sicheren Cloud-Lösung vereint."
  },
  {
    category: "Technik",
    question: "Kann ich Daten aus meinem alten System importieren?",
    answer: "Ja, unser Smart Import Center unterstützt CSV- und Excel-Dateien. Eine KI hilft Ihnen dabei, die Spalten Ihres alten Systems automatisch den richtigen Feldern in SwissBroker OS zuzuordnen."
  },
  {
    category: "Preise",
    question: "Gibt es eine kostenlose Testversion?",
    answer: "Ja, Sie können SwissBroker OS 14 Tage lang kostenlos und unverbindlich testen. Keine Kreditkarte erforderlich."
  }
];

export const MOCK_CLIENT_NOTES: ClientNote[] = [];
export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'al1', clientId: 'c1', type: 'MEETING', title: 'Jahresgespräch', description: 'Besprechung der Vorsorgesituation', timestamp: '2024-05-20 14:00', authorName: 'Max Muster' },
    { id: 'al2', clientId: 'c1', type: 'POLICY_ADD', title: 'Police hinzugefügt', description: 'Neue Hausratversicherung AXA', timestamp: '2024-05-18 09:30', authorName: 'System' }
];

export const MOCK_LEAD_OFFERS: LeadOffer[] = [
    {
        id: 'lo1',
        type: 'MORTGAGE',
        title: 'Hypothekaranfrage EFH Zürich',
        description: 'Kunde sucht Finanzierung für Eigentumswohnung. Kaufpreis 1.2M, Eigenkapital 400k vorhanden. Wünscht Beratung zu Festhypothek.',
        volume: 800000,
        price: 150,
        canton: 'Zürich',
        datePosted: '2024-06-01',
        status: 'AVAILABLE',
        sellerTenantId: 't2',
        sellerName: 'Finanz & Partner',
        sellerRating: 4.8,
        sellerDealCount: 45,
        qualityScore: 95,
        verificationStatus: { phoneVerified: true, emailVerified: true, intentVerified: true },
        guaranteeIncluded: true
    },
    {
        id: 'lo2',
        type: 'INSURANCE',
        title: 'KMU sucht BVG Lösung',
        description: 'Architekturbüro mit 12 Mitarbeitern sucht neue Pensionskassenlösung. Unzufrieden mit aktueller Verwaltungskosten.',
        volume: 45000, // Annual Premium Volume
        price: 350,
        canton: 'Bern',
        datePosted: '2024-06-02',
        status: 'AVAILABLE',
        sellerTenantId: 't3',
        sellerName: 'Hans Consult',
        sellerRating: 4.2,
        sellerDealCount: 12,
        qualityScore: 85,
        verificationStatus: { phoneVerified: true, emailVerified: true, intentVerified: true },
        guaranteeIncluded: false
    }
];

export const MOCK_JOBS = [
    { id: 'j1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Zürich / Remote', type: 'Vollzeit' },
    { id: 'j2', title: 'Sales Manager DACH', department: 'Sales', location: 'Zürich', type: 'Vollzeit' },
    { id: 'j3', title: 'Customer Success Manager', department: 'Support', location: 'Bern / Remote', type: '80-100%' }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: 't1',
        quote: "SwissBroker OS hat unsere Prozesse revolutioniert. Wir sparen 30% Zeit in der Administration.",
        author: "Thomas Keller",
        role: "CEO",
        company: "Keller & Partner AG",
        avatar: "https://ui-avatars.com/api/?name=Thomas+Keller"
    },
    {
        id: 't2',
        quote: "Endlich ein System, das Schweizer Bedürfnisse versteht. Die Hypotheken-Tools sind genial.",
        author: "Sarah Muster",
        role: "Inhaberin",
        company: "Muster Finanz",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Muster"
    }
];