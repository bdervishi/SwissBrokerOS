
import { AssetType, Client, MortgageType, Policy, PolicyStatus, UserRole, AIAdvice, Asset, MortgageScenario, Integration, IntegrationCategory, IntegrationStatus, PolicyDocument, Claim, Partner, PartnerCategory, PartnerStatus, CalendarEvent, EventType, RelatedEntityType, Commission, CommissionType, CommissionStatus, User, Tenant, SaaSPackage, Email, Team, TimeEntry, TaxSummary, TaxReturn, Testimonial, BankOffer, CreditType, StaticPage, MegaMenuCategory, SaaSAddon, ClientNote, ActivityLog } from './types';

export const APP_NAME = "SwissBroker OS";

// --- STRUCTURED FAQS ---
export const FAQS = [
  {
    category: "Allgemein",
    question: "Was ist SwissBroker OS?",
    answer: "Es ist das erste ganzheitliche Betriebssystem für Schweizer Broker, das CRM, HR, KI-Akquise und Finanz-Simulationen in einer sicheren Cloud-Lösung vereint."
  },
  {
    category: "KI & Sicherheit",
    question: "Wo werden meine Daten gespeichert?",
    answer: "Sämtliche Daten werden ausschliesslich in ISO-zertifizierten Tier IV Datacentern im Kanton Zürich, Schweiz, gespeichert. Wir erfüllen die nDSG-Anforderungen vollständig."
  },
  {
    category: "KI & Sicherheit",
    question: "Wie nutzt SwissBroker OS künstliche Intelligenz?",
    answer: "Wir nutzen KI (Google Gemini) für die automatisierte Analyse von Policen, die Generierung von Steuertipps und zur Unterstützung bei der Neukundenakquise über den Lead Radar."
  },
  {
    category: "Preise & Verträge",
    question: "Gibt es eine kostenlose testphase?",
    answer: "Ja, Sie können SwissBroker OS 14 Tage lang unverbindlich mit vollem Funktionsumfang testen. Danach wählen Sie das passende Paket (Starter, Pro oder Enterprise)."
  },
  {
    category: "Preise & Verträge",
    question: "Kann ich mein Abo jederzeit kündigen?",
    answer: "Unsere Standard-Abos sind monatlich kündbar. Bei jährlicher Zahlung gewähren wir attraktive Rabatte, binden Sie aber für 12 Monate."
  },
  {
    category: "Technik",
    question: "Benötige ich eine spezielle Software-Installation?",
    answer: "Nein, SwissBroker OS ist eine 100% webbasierte SaaS-Lösung. Sie benötigen lediglich einen modernen Browser auf Ihrem PC, Mac oder Tablet."
  },
  {
    category: "Technik",
    question: "Kann ich Daten aus meinem alten System importieren?",
    answer: "Ja, unser Smart Import Center unterstützt CSV- und Excel-Dateien. Eine KI hilft Ihnen dabei, die Spalten Ihres alten Systems automatisch den richtigen Feldern in SwissBroker OS zuzuordnen."
  }
];

// --- MOCK NAVIGATION ---
export const MOCK_NAVIGATION: MegaMenuCategory[] = [
    {
        id: 'nav_solutions',
        title: 'Lösungen',
        links: [
            { id: 'l1', title: 'CRM für Makler', description: 'Zentrales Klienten-Register nach nDSG.', path: '/features/crm', iconName: 'Users' },
            { id: 'l2', title: 'KI-Risikoanalyse', description: 'Identifizieren Sie Vorsorgelücken automatisch.', path: '/features/ai-risk', iconName: 'BrainCircuit' },
            { id: 'l3', title: 'Hypothekenrechner', description: 'Interaktive Simulationen in Echtzeit.', path: '/features/mortgage-calc', iconName: 'Calculator' },
            { id: 'l4', title: 'Steuermodul', description: 'Automatisierte Steueroptimierung.', path: '/features/tax-module', iconName: 'ShieldCheck' }
        ]
    },
    {
        id: 'nav_resources',
        title: 'Ressourcen',
        links: [
            { id: 'r1', title: 'Partner Hub', description: 'Alle Versicherer & Banken auf einen Blick.', path: '/partners', iconName: 'Handshake' },
            { id: 'r2', title: 'Smart Import', description: 'Migrieren Sie Daten in wenigen Minuten.', path: '/import', iconName: 'Database' },
            { id: 'r3', title: 'Hilfe-Center (FAQ)', description: 'Fragen & Antworten zu SwissBroker.', path: '/faq', iconName: 'Info' }
        ]
    },
    {
        id: 'nav_company',
        title: 'Unternehmen',
        links: [
            { id: 'c1', title: 'Über Uns', description: 'Unsere Mission & Geschichte.', path: '/p/ueber-uns', iconName: 'Info' },
            { id: 'c2', title: 'Karriere', description: 'Werde Teil unseres Teams.', path: '/career', iconName: 'Briefcase' },
            { id: 'c3', title: 'Partner Programm', description: 'SwissBroker empfehlen & verdienen.', path: '/affiliate', iconName: 'DollarSign' }
        ]
    }
];

// --- MOCK JOBS ---
export const MOCK_JOBS = [
    { id: 'j1', title: 'Senior Fullstack Engineer (React)', location: 'Zürich / Remote', type: '100%', department: 'Engineering' },
    { id: 'j2', title: 'Head of Sales DACH', location: 'Zürich', type: '100%', department: 'Growth' },
    { id: 'j3', title: 'Customer Success Manager', location: 'Bern / Remote', type: '80-100%', department: 'Operations' },
];

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
        modules: ['INSURANCE', 'MORTGAGE', 'PENSION', 'TAX', 'CREDIT'],
        birthDate: '1982-03-12',
        familyStatus: 'Verheiratet, 2 Kinder',
        ahvNumber: '756.1234.5678.90',
        entryDate: '2015-01-01',
        noticePeriod: '6 Monate',
        employmentPercentage: 100,
        baseSalary: 12500,
        bonusAgreement: '10% vom Gewinnanteil'
    },
    { 
        id: 'u_broker_2', 
        firstName: 'Lisa', 
        lastName: 'Admin', 
        email: 'office@muster-broker.ch', 
        role: UserRole.BROKER_ADMINISTRATION, 
        organizationName: 'Muster Broker AG', 
        tenantId: 't1', 
        teamId: 'team_backoffice', 
        position: 'Leitung Administration', 
        phone: '+41 44 999 88 77',
        modules: ['INSURANCE', 'TAX'],
        birthDate: '1990-07-22',
        familyStatus: 'Ledig',
        ahvNumber: '756.9988.7766.55',
        entryDate: '2018-06-01',
        noticePeriod: '3 Monate',
        employmentPercentage: 80,
        baseSalary: 6800,
        bonusAgreement: 'CHF 50 pro neuem KVG-Abschluss'
    },
    { id: 'u_broker_3', firstName: 'Tom', lastName: 'Marketing', email: 'marketing@muster-broker.ch', role: UserRole.BROKER_MARKETING, organizationName: 'Muster Broker AG', tenantId: 't1', teamId: 'team_backoffice', position: 'Marketing Manager' },
    { 
        id: 'u_agent_1', 
        firstName: 'Felix', 
        lastName: 'Fieldagent', 
        email: 'felix@muster-broker.ch', 
        role: UserRole.BROKER_AGENT, 
        organizationName: 'Muster Broker AG', 
        tenantId: 't1', 
        teamId: 'team_sales', 
        position: 'Senior Berater', 
        phone: '+41 78 555 66 77', 
        avatarUrl: 'https://i.pravatar.cc/150?u=felix', 
        modules: ['INSURANCE', 'MORTGAGE', 'PENSION'],
        birthDate: '1985-11-05',
        familyStatus: 'Verheiratet',
        ahvNumber: '756.4433.2211.00',
        entryDate: '2020-03-01',
        noticePeriod: '3 Monate',
        employmentPercentage: 100,
        baseSalary: 4500,
        bonusAgreement: 'Provision: 60% Split (70% ab Gold Status)'
    },
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

// --- SAAS ADDONS ---
export const MOCK_ADDONS: SaaSAddon[] = [
    { id: 'addon_website', name: 'Web-Engine & SEO', description: 'Eigener Website-Baukasten mit Lead-Generierung und CRM-Anbindung.', price: 29, iconName: 'Layout' },
    { id: 'addon_ai_plus', name: 'AI Power Pack', description: 'Unlimitierte Token für E-Mail Analyse und Risiko-Checks.', price: 49, iconName: 'BrainCircuit' },
    { id: 'addon_whitelabel', name: 'Full White Label', description: 'Entfernen Sie alle "Powered by SwissBroker" Hinweise.', price: 99, iconName: 'Palette' },
];

export const MOCK_SAAS_PACKAGES: SaaSPackage[] = [
  { id: 'pkg_starter', name: 'Broker Starter', description: 'Perfekt für Einzelmakler, die digital starten wollen.', price: 99, billingCycle: 'MONTHLY', features: ['Bis zu 50 Klienten', 'Basis CRM & Policen', 'Kalender Integration', 'Email Support'], maxUsers: 1, supportLevel: 'EMAIL', includedAddons: [] },
  { id: 'pkg_pro', name: 'Professional', description: 'Für wachsende Teams mit Automatisierungsbedarf.', price: 249, billingCycle: 'MONTHLY', features: ['Bis zu 500 Klienten', 'Hypotheken-Rechner', 'Schnittstellen (Bexio, etc.)', 'Automatische Workflows', '3 Benutzer inklusive'], isPopular: true, maxUsers: 5, supportLevel: 'PRIORITY', includedAddons: [] },
  { id: 'pkg_enterprise', name: 'Enterprise', description: 'Maßgeschneiderte Lösung für grosse Organisationen.', price: 899, billingCycle: 'MONTHLY', features: ['Unlimitierte Klienten', 'White Labeling', 'API Zugriff', 'Dedizierter Success Manager', 'Unlimitierte Benutzer'], maxUsers: 999, supportLevel: 'DEDICATED', includedAddons: ['addon_website', 'addon_ai_plus'] }
];

export const MOCK_TENANTS: Tenant[] = [
    { id: 't1', name: 'Muster Broker AG', plan: 'PROFESSIONAL', status: 'ACTIVE', usersCount: 3, mrr: 250, joinedDate: '2023-01-15', branding: { primaryColor: '#0ea5e9', logoText: 'Muster Broker' }, activeAddons: [] },
    { id: 't2', name: 'Finanz & Partner GmbH', plan: 'ENTERPRISE', status: 'ACTIVE', usersCount: 12, mrr: 850, joinedDate: '2022-11-01', branding: { primaryColor: '#dc2626', logoText: 'F&P Finance' }, activeAddons: ['addon_website'] },
    { id: 't3', name: 'Solo Broker Hans', plan: 'STARTER', status: 'TRIAL', usersCount: 1, mrr: 0, joinedDate: '2024-05-20', branding: { primaryColor: '#10b981', logoText: 'Hans Consult' }, activeAddons: [] },
    { id: 't_demo_1', name: 'David Consult (Demo)', plan: 'STARTER', status: 'ACTIVE', usersCount: 1, mrr: 99 + 29, joinedDate: '2024-01-01', branding: { primaryColor: '#f59e0b', logoText: 'David Consult' }, activeAddons: ['addon_website'] },
    { id: 't_demo_2', name: 'Prime Finance AG (Demo)', plan: 'ENTERPRISE', status: 'ACTIVE', usersCount: 25, mrr: 2500, joinedDate: '2023-06-01', branding: { primaryColor: '#7c3aed', logoText: 'Prime Finance' }, activeAddons: ['addon_website'] },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', firstName: 'Thomas', lastName: 'Müller', email: 'thomas.mueller@example.ch', role: UserRole.CLIENT, address: 'Bahnhofstrasse 12', zipCity: '8001 Zürich', birthDate: '1980-05-15', advisorId: 'u_broker_1', taxDomicile: 'Zürich', avatarUrl: 'https://picsum.photos/id/1005/200/200' },
  { id: 'c2', firstName: 'Sarah', lastName: 'Keller', email: 'sarah.keller@example.ch', role: UserRole.CLIENT, address: 'Seestrasse 45', zipCity: '6000 Luzern', birthDate: '1992-11-20', advisorId: 'u_broker_1', taxDomicile: 'Luzern', avatarUrl: 'https://picsum.photos/id/1011/200/200' },
  { id: 'c3', firstName: 'Peter', lastName: 'Agenturkunden', email: 'peter.ag@example.ch', role: UserRole.CLIENT, address: 'Bergweg 3', zipCity: '3000 Bern', birthDate: '1988-01-01', advisorId: 'u_agent_1', taxDomicile: 'Bern', avatarUrl: 'https://picsum.photos/id/1025/200/200' }
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
  { id: 'int_finnova', name: 'Finnova Open Wealth', description: 'Direkte Anbindung an Bankdaten für die Vermögensübersicht.', category: IntegrationCategory.BANKING, status: IntegrationStatus.DISCONNECTED, iconUrl: 'F', lastSync: '-', connectionType: 'API_KEY' },
  // Credit Providers
  { id: 'int_banknow', name: 'BANK-now API', description: 'Direkte Anbindung für Kreditentscheide in Echtzeit.', category: IntegrationCategory.FINANCE_PROVIDER, status: IntegrationStatus.CONNECTED, iconUrl: 'BN', lastSync: 'Live', connectionType: 'API_KEY' },
  { id: 'int_cembra', name: 'Cembra Money Bank', description: 'Leasing-Kalkulation und Antragsstrecke.', category: IntegrationCategory.FINANCE_PROVIDER, status: IntegrationStatus.CONNECTED, iconUrl: 'CM', lastSync: 'Live', connectionType: 'OAUTH' },
];

export const MOCK_PARTNERS: Partner[] = [
  { id: 'partner_axa', name: 'AXA Versicherungen', category: PartnerCategory.INSURANCE, status: PartnerStatus.ACTIVE, description: 'Führender Allbranchenversicherer in der Schweiz. Spezialisiert auf KMU und Berufliche Vorsorge.', website: 'https://www.axa.ch', brokerNumber: 'CH-88291-Broker', contacts: [ { name: 'Peter Muster', role: 'Key Account Manager', email: 'peter.muster@axa.ch', phone: '+41 58 215 00 00' }, { name: 'Support Broker', role: 'Administration', email: 'broker@axa.ch', phone: '+41 58 215 11 11' } ], products: [ { name: 'Berufliche Vorsorge (BVG)', category: 'Vorsorge', commissionRate: 'Bestand 2%', description: 'Vollversicherung und teilautonome Lösungen.' }, { name: 'Sachversicherungen KMU', category: 'Sach', commissionRate: 'Abschluss 15%', description: 'Kombinierte Sach- und Haftpflichtversicherung.' } ] },
  { id: 'partner_zurich', name: 'Zurich Insurance', category: PartnerCategory.INSURANCE, status: PartnerStatus.ACTIVE, description: 'Globaler Versicherer mit starken Schweizer Wurzeln. Innovativ im Bereich Cyber-Risk.', website: 'https://www.zurich.ch', brokerNumber: 'Z-99221-B', contacts: [ { name: 'Anna Müller', role: 'Broker Consultant', email: 'anna.mueller@zurich.ch', phone: '+41 44 628 00 00' } ], products: [ { name: 'Cyber & Data Risk', category: 'Haftpflicht', commissionRate: '15 - 20%', description: 'Umfassender Schutz vor Cyberkriminalität.' }, { name: 'Lebensversicherung', category: 'Leben', commissionRate: 'Abschluss 35‰', description: 'Risikoleben und Erwerbsunfähigkeit.' } ] },
  { id: 'partner_ubs', name: 'UBS Switzerland', category: PartnerCategory.BANK, status: PartnerStatus.PENDING, description: 'Grossbank für Hypothekenfinanzierung und Vermögensverwaltung.', website: 'https://www.ubs.com', brokerNumber: 'Pending', contacts: [ { name: 'Hypotheken Desk', role: 'Finanzierung', email: 'hypo@ubs.com', phone: '+41 44 234 11 11' } ], products: [ { name: 'Festhypotheken', category: 'Hypotheken', commissionRate: '0.3% Vermittlung', description: 'Langfristige Zinssicherheit.' }, { name: 'SARON Hypotheken', category: 'Hypotheken', commissionRate: '0.3% Vermittlung', description: 'Geldmarktbasierte Finanzierung.' } ] },
  { id: 'partner_legal', name: 'Kanzlei Meier & Partner', category: PartnerCategory.LEGAL, status: PartnerStatus.ACTIVE, description: 'Spezialisten für Versicherungsrecht und Vertragsprüfung.', website: 'https://meier-legal.ch', brokerNumber: 'N/A', contacts: [ { name: 'Dr. Hans Meier', role: 'Partner', email: 'h.meier@meier-legal.ch', phone: '+41 44 555 66 77' } ], products: [ { name: 'Rechtsberatung Mandanten', category: 'Recht', commissionRate: '10% Kickback', description: 'Prüfung komplexer Policen und Haftungsfragen.' } ] },
  // Credit Partners
  { id: 'partner_banknow', name: 'BANK-now', category: PartnerCategory.BANK, status: PartnerStatus.ACTIVE, description: 'Spezialist für Privatkredite und Leasing.', website: 'https://www.bank-now.ch', brokerNumber: 'BN-8822', contacts: [], products: [{name: 'Privatkredit', category: 'Kredit', commissionRate: '1.5% - 3%', description: 'Flexible Laufzeiten'}] },
  { id: 'partner_cembra', name: 'Cembra Money Bank', category: PartnerCategory.LEASING, status: PartnerStatus.ACTIVE, description: 'Führender Anbieter für Fahrzeugleasing.', website: 'https://www.cembra.ch', brokerNumber: 'CM-9911', contacts: [], products: [{name: 'Auto Leasing', category: 'Leasing', commissionRate: '1% - 2%', description: 'Neuwagen & Occasionen'}] }
];

export const MOCK_BANK_OFFERS: BankOffer[] = [
    { id: 'offer_bn_1', bankName: 'BANK-now', productName: 'CREDIT-now', interestRateRange: [4.9, 9.9], maxDuration: 84, commissionPercentage: 2.5, type: CreditType.PRIVATE },
    { id: 'offer_cem_1', bankName: 'Cembra', productName: 'Financing Plus', interestRateRange: [5.5, 10.5], maxDuration: 72, commissionPercentage: 2.0, type: CreditType.PRIVATE },
    { id: 'offer_migros', bankName: 'Migros Bank', productName: 'Privatkredit', interestRateRange: [4.5, 7.9], maxDuration: 84, commissionPercentage: 1.0, type: CreditType.PRIVATE },
    // Leasing
    { id: 'lease_cem_1', bankName: 'Cembra', productName: 'Auto Leasing', interestRateRange: [3.9, 5.9], maxDuration: 60, commissionPercentage: 1.5, type: CreditType.LEASING },
    { id: 'lease_amag', bankName: 'AMAG Leasing', productName: 'Leasing Plus', interestRateRange: [2.9, 4.9], maxDuration: 48, commissionPercentage: 1.0, type: CreditType.LEASING },
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

export const MOCK_STATIC_PAGES: StaticPage[] = [
    {
        id: 'page_imprint',
        slug: 'impressum',
        isPublished: true,
        lastUpdated: '2024-01-01',
        title: {
            de: 'Impressum',
            en: 'Imprint',
            fr: 'Mentions Légales',
            it: 'Impronta'
        },
        content: {
            de: '<h2>Kontaktadresse</h2><p>SwissBroker OS<br>Fintech Switzerland AG<br>Bahnhofstrasse 1<br>8001 Zürich</p><h2>Handelsregister</h2><p>Eingetragener Firmenname: Fintech Switzerland AG<br>Nummer: CHE-123.456.789</p>',
            en: '<h2>Contact</h2><p>SwissBroker OS<br>Fintech Switzerland AG<br>Bahnhofstrasse 1<br>8001 Zurich</p>',
            fr: '<h2>Contact</h2><p>SwissBroker OS<br>Fintech Switzerland AG<br>Bahnhofstrasse 1<br>8001 Zurich</p>',
            it: '<h2>Contatto</h2><p>SwissBroker OS<br>Fintech Switzerland AG<br>Bahnhofstrasse 1<br>8001 Zurigo</p>'
        }
    },
    {
        id: 'page_privacy',
        slug: 'datenschutz',
        isPublished: true,
        lastUpdated: '2024-03-15',
        title: {
            de: 'Datenschutz',
            en: 'Privacy Policy',
            fr: 'Confidentialité',
            it: 'Privacy'
        },
        content: {
            de: '<h2>Datenschutzerklärung</h2><p>Wir nehmen den Schutz Ihrer Daten ernst.</p><ul><li>Datenhaltung in der Schweiz</li><li>AES-256 Verschlüsselung</li></ul>',
            en: '<h2>Privacy Policy</h2><p>We take data protection seriously.</p>',
            fr: '<h2>Confidentialité</h2><p>Nous prenons la protection des données au sérieux.</p>',
            it: '<h2>Privacy</h2><p>Prendiamo sul serio la protezione dei dati.</p>'
        }
    },
    {
        id: 'page_about',
        slug: 'ueber-uns',
        isPublished: true,
        lastUpdated: '2024-06-01',
        title: {
            de: 'Über Uns',
            en: 'About Us',
            fr: 'À Propos',
            it: 'Chi Siamo'
        },
        content: {
            de: `
                <div class="space-y-16">
                    <div class="text-center space-y-4">
                        <h2 class="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Mehr als nur Software.</h2>
                        <p class="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                            SwissBroker OS ist die Antwort auf den Stillstand. Wir bauen das Betriebssystem für die nächste Generation von Finanzdienstleistern.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <div class="text-4xl mb-4">🇨🇭</div>
                            <h3 class="font-bold text-lg mb-2 text-slate-900">Swissness</h3>
                            <p class="text-slate-600 text-sm">Keine Kompromisse bei Sicherheit und Qualität. Hosting in Zürich, Entwicklung in Bern.</p>
                        </div>
                        <div class="p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <div class="text-4xl mb-4">🚀</div>
                            <h3 class="font-bold text-lg mb-2 text-slate-900">Innovation</h3>
                            <p class="text-slate-600 text-sm">Wir integrieren KI nicht als Gimmick, sondern als Werkzeug für echte Produktivität.</p>
                        </div>
                        <div class="p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <div class="text-4xl mb-4">🤝</div>
                            <h3 class="font-bold text-lg mb-2 text-slate-900">Unabhängigkeit</h3>
                            <p class="text-slate-600 text-sm">Wir gehören keinem Versicherer. Unsere Loyalität gilt ausschließlich den Brokern.</p>
                        </div>
                    </div>

                    <div class="bg-slate-900 text-white p-8 md:p-12 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <h3 className="text-2xl font-bold mb-4">Unsere Geschichte</h3>
                            <p className="text-slate-300 leading-relaxed mb-6">
                                Gestartet 2023 in einem Zürcher Co-Working Space, getrieben von der Frustration über veraltete CRM-Systeme. Heute vertrauen uns über 50 Broker-Firmen in der ganzen Schweiz.
                            </p>
                            <div className="flex gap-8">
                                <div>
                                    <span className="block text-3xl font-black text-brand-400">1'200+</span>
                                    <span className="text-xs uppercase tracking-widest text-slate-400">Nutzer</span>
                                </div>
                                <div>
                                    <span className="block text-3xl font-black text-brand-400">CHF 42M</span>
                                    <span className="text-xs uppercase tracking-widest text-slate-400">Verwaltetes Volumen</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                            <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                    </div>

                    <div class="text-center">
                        <h3 className="text-2xl font-bold mb-6 text-slate-900">Bereit für den Wandel?</h3>
                        <a href="#/career" class="inline-flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-bold rounded-full hover:bg-brand-700 transition-colors shadow-lg">
                            Werde Teil des Teams
                        </a>
                    </div>
                </div>
            `,
            en: '<h2>Our Mission</h2><p>SwissBroker OS revolutionizes how Swiss brokers work.</p>',
            fr: '<h2>Notre Mission</h2><p>SwissBroker OS révolutionne la façon dont les courtiers suisses travaillent.</p>',
            it: '<h2>La Nostra Missione</h2><p>SwissBroker OS rivoluziona il modo in cui lavorano i broker svizzeri.</p>'
        }
    }
];

// --- MOCK NOTES & HISTORY ---
export const MOCK_CLIENT_NOTES: ClientNote[] = [
    { id: 'n1', clientId: 'c1', authorId: 'u_broker_1', authorName: 'Max Muster', content: 'Kunde plant Hauskauf im Kanton Zug für 2025. Hypothekar-Simulator wurde bereits kurz vorgeführt.', createdAt: '20.05.2024, 14:30' },
    { id: 'n2', clientId: 'c1', authorId: 'u_broker_1', authorName: 'Max Muster', content: 'Thomas möchte seine Lebensversicherung erhöhen. Offerte von Swiss Life folgt.', createdAt: '15.05.2024, 09:15' },
    { id: 'n3', clientId: 'c2', authorId: 'u_broker_1', authorName: 'Max Muster', content: 'Rückfrage zu Wasserschaden. Fotos wurden per Email nachgereicht.', createdAt: '22.05.2024, 11:00' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'al1', clientId: 'c1', type: 'MEETING', title: 'Jahresgespräch durchgeführt', description: 'Besprechung der Portfoliostruktur und Steuerabzüge.', timestamp: '20.05.2024, 14:00', authorName: 'Max Muster' },
    { id: 'al2', clientId: 'c1', type: 'POLICY_ADD', title: 'Neue Lebensversicherung', description: 'Säule 3b bei Swiss Life hinterlegt.', timestamp: '18.05.2024, 16:45', authorName: 'System' },
    { id: 'al3', clientId: 'c1', type: 'DOCUMENT_UPLOAD', title: 'Dokument hochgeladen', description: 'Steuerausweis 2023 hinzugefügt.', timestamp: '15.05.2024, 10:20', authorName: 'Thomas Müller' },
    { id: 'al4', clientId: 'c2', type: 'NOTE', title: 'Gesprächsnotiz', description: 'Kunde ist unzufrieden mit der AXA Bearbeitungszeit.', timestamp: '22.05.2024, 11:05', authorName: 'Max Muster' },
    { id: 'al5', clientId: 'c1', type: 'SYSTEM_LOGIN', title: 'Kunden-Login', description: 'Klient hat sich über das Webportal angemeldet.', timestamp: '21.05.2024, 20:15', authorName: 'System' },
];
