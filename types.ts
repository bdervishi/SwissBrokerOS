
export enum UserRole {
    CLIENT = 'CLIENT',
    BROKER_ADMIN = 'BROKER_ADMIN',
    BROKER_ADMINISTRATION = 'BROKER_ADMINISTRATION',
    BROKER_AGENT = 'BROKER_AGENT',
    BROKER_MARKETING = 'BROKER_MARKETING',
    SAAS_SUPER_ADMIN = 'SAAS_SUPER_ADMIN',
    SAAS_ACQUISITION = 'SAAS_ACQUISITION',
    SAAS_SALES = 'SAAS_SALES',
    SAAS_FINANCE = 'SAAS_FINANCE',
    SAAS_MARKETING = 'SAAS_MARKETING'
}

export type AIProviderType = 'GOOGLE_GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'CUSTOM_OPEN_SOURCE';

export interface AIModelConfig {
    provider: AIProviderType;
    modelName: string;
    apiKey?: string; // Managed via Environment or Tenant Vault
    baseUrl?: string; // For Custom/Local Models
    capabilities: {
        canProcessAudio: boolean;
        canProcessVision: boolean;
        canGroundSearch: boolean;
    };
    costPer1kTokens: number;
}

/* Fix: Added BrandingConfig interface */
export interface BrandingConfig {
    primaryColor: string;
    logoText: string;
    logoUrl?: string;
}

/* Fix: Added HRConfig interface */
export interface HRConfig {
    requireTimeSubmission: boolean;
    requireTimeApproval: boolean;
    workWeekHours: number;
}

/* Fix: Added ComplianceStats interface */
export interface ComplianceStats {
    finmaStatus: string;
    ciceroNumber?: string;
    churnRisk: string;
}

/* Fix: Expanded Tenant interface to include plan, status, and other missing properties */
export interface Tenant {
    id: string;
    name: string;
    plan: string;
    status: string;
    usersCount: number;
    mrr: number;
    joinedDate: string;
    aiConfig?: {
        activeProvider: AIProviderType;
        selectedModel: string;
        customEndpoint?: string;
        useFallback: boolean;
    };
    branding: BrandingConfig;
    activeAddons: string[];
    hrConfig?: HRConfig;
    complianceStats?: ComplianceStats;
}

export interface LeadActivity {
    id: string;
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'SYSTEM' | 'AI_GENERATION';
    title: string;
    description: string;
    timestamp: string;
    authorName: string;
    metadata?: {
        duration?: number;
        sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
        tokenUsage?: number;
        aiProvider?: AIProviderType; // Track which AI was used
        aiModel?: string;
    };
}

/* Fix: Added missing AssetType enum */
export enum AssetType {
    CASH = 'CASH',
    PILLAR_3A = 'PILLAR_3A',
    REAL_ESTATE = 'REAL_ESTATE',
    SECURITIES = 'SECURITIES',
    PENSION_FUND = 'PENSION_FUND'
}

/* Fix: Added missing Asset interface */
export interface Asset {
    id: string;
    clientId: string;
    name: string;
    type: AssetType;
    value: number;
    lastUpdated: string;
    provider?: string;
}

/* Fix: Added missing Client interface */
export interface Client {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatarUrl: string;
    tenantId: string;
    address: string;
    zipCity: string;
    birthDate: string;
    advisorId: string;
    taxDomicile: string;
    companyName?: string;
    trustScore?: TrustScore;
}

/* Fix: Added missing MortgageType enum */
export enum MortgageType {
    FIXED = 'FIXED',
    SARON = 'SARON',
    MIXED = 'MIXED'
}

/* Fix: Added missing PolicyStatus enum */
export enum PolicyStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED'
}

/* Fix: Added missing Policy interface */
export interface Policy {
    id: string;
    clientId: string;
    insurer: string;
    type: string;
    policyNumber: string;
    startDate: string;
    endDate: string;
    premiumAmount: number;
    premiumFrequency: string;
    status: PolicyStatus;
    cancellationNoticePeriod: number;
    deductible?: number;
    coverageDetails?: string[];
    initialCommission?: number;
    liabilityDurationMonths?: number;
    marketBenchmarkDelta?: number;
    contractFlags?: string[];
}

/* Fix: Added missing AIAdvice interface */
export interface AIAdvice {
    id: string;
    clientId: string;
    category: string;
    title: string;
    description: string;
    severity: string;
    actionItem: string;
}

/* Fix: Added missing MortgageScenario interface */
export interface MortgageScenario {
    id: string;
    clientId: string;
    propertyName: string;
    propertyValue: number;
    loanAmount: number;
    ownCapital: number;
    interestRate: number;
    durationYears: number;
    type: MortgageType;
    monthlyCost: number;
    startDate: string;
    endDate: string;
    amortizationMethod: string;
    applicationStatus: string;
}

/* Fix: Added missing IntegrationCategory enum */
export enum IntegrationCategory {
    ACCOUNTING = 'ACCOUNTING',
    COMMUNICATION = 'COMMUNICATION',
    BANKING = 'BANKING'
}

/* Fix: Added missing IntegrationStatus enum */
export enum IntegrationStatus {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    ERROR = 'ERROR'
}

/* Fix: Added missing Integration interface */
export interface Integration {
    id: string;
    name: string;
    description: string;
    category: IntegrationCategory;
    status: IntegrationStatus;
    iconUrl: string;
    lastSync: string;
    connectionType: string;
    errorMessage?: string;
}

/* Fix: Added missing PolicyDocument interface */
export interface PolicyDocument {
    id: string;
    policyId: string;
    title: string;
    type: string;
    date: string;
    size: string;
}

/* Fix: Added missing Claim interface */
export interface Claim {
    id: string;
    policyId: string;
    date: string;
    description: string;
    status: string;
    amount: number;
}

/* Fix: Added missing PartnerCategory enum */
export enum PartnerCategory {
    INSURANCE = 'INSURANCE',
    BANK = 'BANK',
    LEGAL = 'LEGAL',
    SERVICE = 'SERVICE'
}

/* Fix: Added missing PartnerStatus enum */
export enum PartnerStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    INACTIVE = 'INACTIVE'
}

/* Fix: Added missing Partner interface */
export interface Partner {
    id: string;
    name: string;
    category: PartnerCategory;
    status: PartnerStatus;
    description: string;
    website: string;
    brokerNumber: string;
    contacts: { name: string; role: string; email: string; phone: string; }[];
    products: { name: string; category: string; commissionRate: string; description: string; }[];
    logoUrl?: string;
}

/* Fix: Added missing EventType enum */
export enum EventType {
    MEETING = 'MEETING',
    DEADLINE = 'DEADLINE',
    TASK = 'TASK',
    BIRTHDAY = 'BIRTHDAY'
}

/* Fix: Added missing RelatedEntityType enum */
export enum RelatedEntityType {
    CLIENT = 'CLIENT',
    POLICY = 'POLICY',
    MORTGAGE = 'MORTGAGE',
    PARTNER = 'PARTNER'
}

/* Fix: Added missing CalendarEvent interface */
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: EventType;
    relatedId: string;
    relatedType: RelatedEntityType;
    isAllDay: boolean;
    description?: string;
}

/* Fix: Added missing CommissionType enum */
export enum CommissionType {
    ACQUISITION = 'ACQUISITION',
    RECURRING = 'RECURRING',
    ONE_OFF = 'ONE_OFF'
}

/* Fix: Added missing CommissionStatus enum */
export enum CommissionStatus {
    PAID = 'PAID',
    PENDING = 'PENDING'
}

/* Fix: Added missing Commission interface */
export interface Commission {
    id: string;
    date: string;
    amount: number;
    currency: string;
    type: CommissionType;
    status: CommissionStatus;
    source: string;
    partnerName: string;
    description: string;
    agentId: string;
    agentSplitPercentage: number;
}

/* Fix: Added missing User interface */
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatarUrl?: string;
    tenantId?: string;
    teamId?: string;
    organizationName?: string;
    modules?: EmployeeModule[];
    position?: string;
    phone?: string;
    street?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    birthDate?: string;
    familyStatus?: string;
    childrenCount?: number;
    bankName?: string;
    iban?: string;
    ahvNumber?: string;
    baseSalary?: number;
    entryDate?: string;
    employmentPercentage?: number;
    noticePeriod?: string;
    bonusAgreement?: string;
}

/* Fix: Added missing SaaSPackage interface */
export interface SaaSPackage {
    id: string;
    name: string;
    description: string;
    price: number;
    billingCycle: string;
    features: string[];
    maxUsers: number;
    supportLevel: string;
    includedAddons: string[];
    isPopular?: boolean;
}

/* Fix: Added missing Email interface */
export interface Email {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    preview: string;
    content: string;
    date: Date;
    isRead: boolean;
    folder: string;
    source: string;
    priority: string;
    tags: string[];
    category: string;
    snoozedUntil?: Date;
    attachments?: { name: string; type: string; }[];
}

/* Fix: Added missing Team interface */
export interface Team {
    id: string;
    name: string;
    description: string;
    leaderId: string;
}

/* Fix: Added missing TimeEntryStatus type */
export type TimeEntryStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

/* Fix: Added missing TimeEntry interface */
export interface TimeEntry {
    id: string;
    userId: string;
    date: string;
    hours: number;
    activity: string;
    description: string;
    relatedClientId?: string;
    status: TimeEntryStatus;
    rejectionReason?: string;
}

/* Fix: Added missing TaxSummary interface */
export interface TaxSummary {
    clientId: string;
    year: number;
    deductiblePremiums: number;
    pillar3aContributions: number;
    debtInterest: number;
    medicalExpenses: number;
    status: string;
}

/* Fix: Added missing TaxReturnStatus type */
export type TaxReturnStatus = 'OPEN' | 'DOCS_MISSING' | 'IN_PROGRESS' | 'REVIEW' | 'SUBMITTED' | 'ARCHIVED';

/* Fix: Added missing TaxReturn interface */
export interface TaxReturn {
    id: string;
    clientId: string;
    year: number;
    canton: string;
    status: TaxReturnStatus;
    deadline: string;
    documentsCount: number;
    taxableIncome: number;
    deductionsTotal: number;
    notes?: string;
}

/* Fix: Added missing Testimonial interface */
export interface Testimonial {
    id: string;
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar: string;
}

/* Fix: Added missing CreditType enum */
export enum CreditType {
    PRIVATE = 'PRIVATE',
    LEASING = 'LEASING'
}

/* Fix: Added missing BankOffer interface */
export interface BankOffer {
    id: string;
    bankName: string;
    productName: string;
    interestRateRange: [number, number];
    maxDuration: number;
    commissionPercentage: number;
    type: CreditType;
}

/* Fix: Added missing LocalizedContent interface */
export interface LocalizedContent {
    de: string;
    en: string;
    fr: string;
    it: string;
}

/* Fix: Added missing StaticPage interface */
export interface StaticPage {
    id: string;
    slug: string;
    isPublished: boolean;
    lastUpdated: string;
    title: LocalizedContent;
    content: LocalizedContent;
}

/* Fix: Added missing MegaMenuLink interface */
export interface MegaMenuLink {
    id: string;
    title: string;
    description: string;
    path: string;
    iconName: string;
}

/* Fix: Added missing MegaMenuCategory interface */
export interface MegaMenuCategory {
    id: string;
    title: string;
    links: MegaMenuLink[];
}

/* Fix: Added missing SaaSAddon interface */
export interface SaaSAddon {
    id: string;
    name: string;
    description: string;
    price: number;
    iconName: string;
}

/* Fix: Added missing ClientNote interface */
export interface ClientNote {
    id: string;
    clientId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
}

/* Fix: Added missing ActivityType type */
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'SYSTEM' | 'AI_GENERATION' | 'POLICY_ADD' | 'MORTGAGE_ADD' | 'DOCUMENT_UPLOAD' | 'SYSTEM_LOGIN';

/* Fix: Added missing ActivityLog interface */
export interface ActivityLog {
    id: string;
    clientId: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
    authorName: string;
}

/* Fix: Added missing LeadOffer interface */
export interface LeadOffer {
    id: string;
    type: 'MORTGAGE' | 'INSURANCE' | 'INVESTMENT';
    title: string;
    description: string;
    volume: number;
    price: number;
    canton: string;
    datePosted: string;
    status: 'AVAILABLE' | 'SOLD';
    sellerTenantId: string;
    sellerName: string;
    sellerRating: number;
    sellerDealCount: number;
    qualityScore: number;
    verificationStatus: { phoneVerified: boolean; emailVerified: boolean; intentVerified: boolean; };
    guaranteeIncluded: boolean;
}

/* Fix: Added missing InsuranceSwitchScenario interface */
export interface InsuranceSwitchScenario {
    id: string;
    policyId: string;
    currentPremium: number;
    newOffer: {
        insurer: string;
        premium: number;
        deductible: number;
        highlights: string;
    };
}

/* Fix: Added missing ComplianceCheck interface */
export interface ComplianceCheck {
    id: string;
    checkName: string;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    lastChecked: string;
    details?: string;
}

/* Fix: Added missing TrustScore interface */
export interface TrustScore {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    lastUpdated: string;
    checks: ComplianceCheck[];
}

/* Fix: Added missing EmployeeModule type */
export type EmployeeModule = 'INSURANCE' | 'MORTGAGE' | 'TAX' | 'PENSION';

/* Fix: Added missing LeadContact interface */
export interface LeadContact {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
}

/* Fix: Added missing LeadTask interface */
export interface LeadTask {
    id: string;
    label: string;
    dueDate: string;
    isCompleted: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/* Fix: Added missing LeadOfferConfig interface */
export interface LeadOfferConfig {
    id: string;
    name: string;
}

/* Fix: Added missing Lead interface */
export interface Lead {
    id: string;
    tenantId: string;
    name: string;
    city: string;
    address: string;
    status: 'NEW' | 'CONTACTED' | 'OFFER' | 'WON' | 'LOST';
    potentialValue: number;
    type: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
    source: string;
    aiInsightScore: number;
    contacts: LeadContact[];
    activities: LeadActivity[];
    interests: string[];
    tasks: LeadTask[];
    offers: any[];
}

/* Fix: Added missing WebSectionType type */
export type WebSectionType = 'HERO' | 'SERVICES' | 'CALCULATOR' | 'CONTACT' | 'ABOUT' | 'TESTIMONIALS';

/* Fix: Added missing WebSection interface */
export interface WebSection {
    id: string;
    type: WebSectionType;
    title: string;
    content: string;
    isVisible: boolean;
    order: number;
    image?: string;
    config?: any;
}

/* Fix: Added missing CaseStudy interface */
export interface CaseStudy {
    id: string;
    title: string;
    title_de: string;
    client: string;
    category: string;
    year: string;
    description: string;
    description_de: string;
    challenge: string;
    challenge_de: string;
    solution: string;
    solution_de: string;
    result: string;
    result_de: string;
    technologies: string[];
    stats: { label: string; label_de: string; value: string; }[];
    image_prompt: string;
    createdAt: string;
}

/* NEW: Objection Types */
export interface SalesObjection {
    id: string;
    category: 'PRICE' | 'COMPETITION' | 'TIMING' | 'TRUST' | 'NEED';
    label: string;
    commonPhrases: string[];
    counterTactics: string[];
}
