

/**
 * Enums representing Database Enums
 */
export enum UserRole {
  // SAAS Roles
  SAAS_SUPER_ADMIN = 'SAAS_SUPER_ADMIN',
  SAAS_SALES = 'SAAS_SALES',
  SAAS_MARKETING = 'SAAS_MARKETING',
  SAAS_FINANCE = 'SAAS_FINANCE',
  SAAS_ACQUISITION = 'SAAS_ACQUISITION', // NEW: Hunting Brokers & Partners (Garagen)

  // BROKER Roles
  BROKER_ADMIN = 'BROKER_ADMIN', // Inhaber
  BROKER_ADMINISTRATION = 'BROKER_ADMINISTRATION', // Backoffice
  BROKER_MARKETING = 'BROKER_MARKETING',
  BROKER_AGENT = 'BROKER_AGENT', // NEW: Externe Vermittler / Aussendienst

  // CLIENT Roles
  CLIENT = 'CLIENT'
}

export type EmployeeModule = 'INSURANCE' | 'MORTGAGE' | 'TAX' | 'PENSION' | 'CREDIT';

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum MortgageType {
  FIXED = 'FIXED',
  SARON = 'SARON',
  MIXED = 'MIXED'
}

export enum CreditType {
    PRIVATE = 'PRIVATE',
    LEASING = 'LEASING'
}

export enum AssetType {
  CASH = 'CASH',
  SECURITIES = 'SECURITIES',
  REAL_ESTATE = 'REAL_ESTATE',
  PILLAR_3A = 'PILLAR_3A',
  PENSION_FUND = 'PENSION_FUND' // BVG
}

export enum IntegrationCategory {
  ACCOUNTING = 'ACCOUNTING',
  COMMUNICATION = 'COMMUNICATION',
  CRM = 'CRM',
  BANKING = 'BANKING',
  FINANCE_PROVIDER = 'FINANCE_PROVIDER'
}

export enum IntegrationStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export enum PartnerCategory {
  INSURANCE = 'INSURANCE',
  BANK = 'BANK',
  LEGAL = 'LEGAL',
  SERVICE = 'SERVICE',
  LEASING = 'LEASING'
}

export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

export enum EventType {
  MEETING = 'MEETING',
  TASK = 'TASK',
  DEADLINE = 'DEADLINE', // e.g. Policy Expiry
  BIRTHDAY = 'BIRTHDAY'
}

export enum RelatedEntityType {
  CLIENT = 'CLIENT',
  POLICY = 'POLICY',
  MORTGAGE = 'MORTGAGE',
  PARTNER = 'PARTNER',
  NONE = 'NONE'
}

export enum CommissionType {
  RECURRING = 'RECURRING', // Bestandspflege (jährlich)
  ACQUISITION = 'ACQUISITION', // Abschluss (einmalig)
  ONE_OFF = 'ONE_OFF' // Tippgeber / Finder's Fee
  ,
    SUBSCRIPTION = "SUBSCRIPTION"
}

export enum CommissionStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FORECAST = 'FORECAST'
}

export type TaxReturnStatus = 'OPEN' | 'DOCS_MISSING' | 'IN_PROGRESS' | 'REVIEW' | 'SUBMITTED' | 'ARCHIVED';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

// --- NEW: Marketing Case Study Types ---
export interface CaseStudyStat {
  label: string;
  label_de: string;
  value: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  title_de: string;
  client: string;
  category: 'AI' | 'Web3' | 'Automation' | 'Design' | 'Consulting';
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
  stats: CaseStudyStat[];
  image_prompt: string;
  createdAt: string;
}

/**
 * Interfaces mirroring the Prisma Schema for the Frontend
 */

export interface Team {
    id: string;
    name: string;
    description?: string;
    leaderId?: string; // Links to User
}

export interface TimeEntry {
    id: string;
    userId: string;
    date: string;
    hours: number;
    activity: string; // e.g., "Kundenberatung", "Administration", "Reisezeit"
    description?: string;
    relatedClientId?: string;
}

export interface User {
  id: string;
  username: string; // NEW
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  organizationName?: string; // For Brokers
  tenantId?: string; // Link to Tenant
  teamId?: string; // Link to Team
  position?: string; // Job Title
  phone?: string;
  
  // New: Responsibilities / Access Areas
  modules?: EmployeeModule[]; 

  // HR Specific Fields
  birthDate?: string;
  familyStatus?: string; // e.g. "Ledig", "Verheiratet, 2 Kinder"
  ahvNumber?: string;
  entryDate?: string;
  noticePeriod?: string; // e.g. "3 Monate"
  employmentPercentage?: number; // e.g 100
  baseSalary?: number;
  bonusAgreement?: string;
}

// Added Client interface
export interface Client {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  address: string;
  zipCity: string;
  birthDate: string;
  advisorId: string;
  taxDomicile: string;
  avatarUrl: string;
  tenantId?: string;
}

// Added Policy interface
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
}

// Added AIAdvice interface
export interface AIAdvice {
  id: string;
  clientId: string;
  category: 'RISK' | 'SAVING';
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  actionItem: string;
}

// Added Asset interface
export interface Asset {
  id: string;
  clientId: string;
  name: string;
  type: AssetType;
  value: number;
  lastUpdated: string;
  provider?: string;
}

// Added MortgageScenario interface
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
  amortizationMethod: 'DIRECT' | 'INDIRECT';
  applicationStatus: 'DRAFT' | 'APPROVED';
  bankTransactionId?: string;
}

// Added Integration interface
export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  iconUrl: string;
  lastSync: string;
  connectionType: 'OAUTH' | 'API_KEY';
  errorMessage?: string;
}

// Added PolicyDocument interface
export interface PolicyDocument {
  id: string;
  policyId: string;
  title: string;
  type: string;
  date: string;
  size: string;
}

// Added Claim interface
export interface Claim {
  id: string;
  policyId: string;
  date: string;
  description: string;
  status: string;
  amount: number;
}

// Added Partner interfaces
export interface PartnerContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface PartnerProduct {
  name: string;
  category: string;
  commissionRate: string;
  description: string;
}

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  status: PartnerStatus;
  description: string;
  website: string;
  brokerNumber: string;
  contacts: PartnerContact[];
  products: PartnerProduct[];
  logoUrl?: string;
}

// Added CalendarEvent interface
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  relatedId: string;
  relatedType: RelatedEntityType;
  description?: string;
  isAllDay: boolean;
}

// Added Commission interface
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
  agentId?: string;
  agentSplitPercentage?: number;
}

// Added BrandingConfig interface
export interface BrandingConfig {
  primaryColor: string;
  logoText: string;
  logoUrl?: string;
}

// Added Tenant interface
export interface Tenant {
  id: string;
  name: string;
  plan: string;
  status: string;
  usersCount: number;
  mrr: number;
  joinedDate: string;
  branding: BrandingConfig;
  activeAddons: string[];
}

// Added SaaSPackage interface
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

// Added Email interfaces
export interface EmailAttachment {
  name: string;
  type: string;
}

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  content: string;
  date: Date;
  isRead: boolean;
  folder: 'INBOX' | 'ARCHIVE';
  relatedClientId?: string;
  relatedPolicyId?: string;
  attachments?: EmailAttachment[];
  source: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  tags?: string[];
  category: string;
  snoozedUntil?: Date;
}

// Added TaxSummary interface
export interface TaxSummary {
  clientId: string;
  year: number;
  deductiblePremiums: number;
  pillar3aContributions: number;
  debtInterest: number;
  medicalExpenses: number;
  status: string;
}

// Added TaxReturn interface
export interface TaxReturn {
  id: string;
  clientId: string;
  year: number;
  canton: string;
  status: TaxReturnStatus;
  deadline: string;
  assignedUserId?: string;
  documentsCount: number;
  notes?: string;
  taxableIncome: number;
  deductionsTotal: number;
}

// Added BankOffer interface
export interface BankOffer {
  id: string;
  bankName: string;
  productName: string;
  interestRateRange: [number, number];
  maxDuration: number;
  commissionPercentage: number;
  type: CreditType;
}

// Added LocalizedContent interface
export interface LocalizedContent {
  de: string;
  en: string;
  fr: string;
  it: string;
}

// Added StaticPage interface
export interface StaticPage {
  id: string;
  slug: string;
  isPublished: boolean;
  lastUpdated: string;
  title: LocalizedContent;
  content: LocalizedContent;
}

// Added MegaMenu interfaces
export interface MegaMenuLink {
  id: string;
  title: string;
  description: string;
  path: string;
  iconName: string;
}

export interface MegaMenuCategory {
  id: string;
  title: string;
  links: MegaMenuLink[];
}

// Added SaaSAddon interface
export interface SaaSAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  iconName: string;
}

// Added ClientNote interface
export interface ClientNote {
  id: string;
  clientId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Added ActivityType and ActivityLog interfaces
export type ActivityType = 'MEETING' | 'TASK' | 'DEADLINE' | 'BIRTHDAY' | 'POLICY_ADD' | 'MORTGAGE_ADD' | 'DOCUMENT_UPLOAD' | 'SYSTEM_LOGIN' | 'NOTE';

export interface ActivityLog {
  id: string;
  clientId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  authorName: string;
}

// Added LeadOffer interface
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
  verificationStatus: {
    phoneVerified: boolean;
    emailVerified: boolean;
    intentVerified: boolean;
  };
  guaranteeIncluded: boolean;
}

// Added WebSection interfaces
export type WebSectionType = 'HERO' | 'SERVICES' | 'CALCULATOR' | 'CONTACT' | 'ABOUT' | 'TESTIMONIALS';

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

// Added InsuranceSwitchScenario placeholder
export interface InsuranceSwitchScenario {
  // Logic for insurance switch scenarios
}
