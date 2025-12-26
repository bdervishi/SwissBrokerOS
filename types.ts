/**
 * Enums representing Database Enums
 */
export enum UserRole {
  // SAAS Roles
  SAAS_SUPER_ADMIN = 'SAAS_SUPER_ADMIN',
  SAAS_SALES = 'SAAS_SALES',
  SAAS_MARKETING = 'SAAS_MARKETING',
  SAAS_FINANCE = 'SAAS_FINANCE',
  SAAS_ACQUISITION = 'SAAS_ACQUISITION', // NEW: Hunting Brokers

  // BROKER Roles
  BROKER_ADMIN = 'BROKER_ADMIN', // Inhaber
  BROKER_ADMINISTRATION = 'BROKER_ADMINISTRATION', // Backoffice
  BROKER_MARKETING = 'BROKER_MARKETING',
  BROKER_AGENT = 'BROKER_AGENT', // NEW: Externe Vermittler / Aussendienst

  // CLIENT Roles
  CLIENT = 'CLIENT'
}

export type EmployeeModule = 'INSURANCE' | 'MORTGAGE' | 'TAX' | 'PENSION';

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
  BANKING = 'BANKING'
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
  SERVICE = 'SERVICE'
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
}

export interface BrandingConfig {
  primaryColor: string; // Hex Code
  logoUrl?: string;
  logoText?: string; // If no image provided
}

// SaaS Tenant (Broker Firm)
export interface Tenant {
  id: string;
  name: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'CHURNED';
  usersCount: number;
  mrr: number;
  joinedDate: string;
  branding: BrandingConfig;
}

export interface SaaSPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  isPopular?: boolean;
  maxUsers?: number;
  supportLevel: 'EMAIL' | 'PRIORITY' | 'DEDICATED';
}

export interface Client extends User {
  address: string;
  zipCity: string;
  birthDate: string;
  advisorId: string;
  taxDomicile: string; // Canton
}

export interface Policy {
  id: string;
  clientId: string;
  insurer: string; // e.g., "Zurich", "AXA"
  type: string; // e.g., "Haftpflicht", "Hausrat"
  policyNumber: string;
  startDate: string;
  endDate: string;
  premiumAmount: number; // in CHF
  premiumFrequency: 'YEARLY' | 'HALF_YEARLY' | 'QUARTERLY' | 'MONTHLY';
  status: PolicyStatus;
  cancellationNoticePeriod: number; // months
  documentUrl?: string;
  coverageDetails?: string[]; // e.g. "Glasbruch", "Diebstahl auswärts"
  deductible?: number; // Selbstbehalt
  
  // Storno / Clawback Fields
  initialCommission?: number; // The commission received at start
  liabilityDurationMonths?: number; // How long is the broker liable? (e.g. 36 months)
}

export interface PolicyDocument {
  id: string;
  policyId: string;
  title: string;
  type: 'CONTRACT' | 'INVOICE' | 'AMENDMENT' | 'GENERAL_CONDITIONS';
  date: string;
  size: string;
}

export interface Claim {
  id: string;
  policyId: string;
  date: string;
  description: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  amount: number;
}

export interface MortgageScenario {
  id: string;
  clientId: string;
  propertyName: string;
  propertyValue: number;
  loanAmount: number;
  ownCapital: number;
  interestRate: number; // percentage
  durationYears: number;
  type: MortgageType;
  monthlyCost: number;
  startDate?: string;
  endDate?: string;
  amortizationMethod?: 'DIRECT' | 'INDIRECT' | 'NONE';
}

export interface Asset {
  id: string;
  clientId: string;
  name: string;
  type: AssetType;
  value: number;
  lastUpdated: string;
  provider?: string; // e.g., Bank name
}

export interface TaxSummary {
  clientId: string;
  year: number;
  deductiblePremiums: number;
  pillar3aContributions: number;
  debtInterest: number; // Hypothekarzinsen
  medicalExpenses: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'; // New field for employee tracking
}

export interface TaxReturn {
    id: string;
    clientId: string;
    year: number;
    canton: string;
    status: TaxReturnStatus;
    deadline?: string;
    assignedUserId?: string;
    documentsCount: number;
    notes?: string;
    // Financial Snapshot for AI
    taxableIncome?: number;
    taxableWealth?: number;
    deductionsTotal?: number;
}

export interface AIAdvice {
  id: string;
  clientId: string;
  category: 'RISK' | 'OPPORTUNITY' | 'SAVING';
  title: string;
  description: string;
  actionItem?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  iconUrl: string; // placeholder for logo
  lastSync?: string;
  errorMessage?: string;
  connectionType?: 'OAUTH' | 'API_KEY';
}

export interface PartnerContact {
  name: string;
  role: string; // e.g. "Key Account Manager", "Schadensdienst"
  email: string;
  phone: string;
}

export interface PartnerProduct {
  name: string;
  category: string;
  commissionRate: string; // e.g. "15% - 20%"
  description: string;
}

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  status: PartnerStatus;
  logoUrl?: string;
  description: string;
  website: string;
  contacts: PartnerContact[];
  products: PartnerProduct[];
  brokerNumber: string; // Maklernummer bei der Gesellschaft
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  relatedId?: string;
  relatedType: RelatedEntityType;
  description?: string;
  isAllDay?: boolean;
}

export interface InsuranceSwitchScenario {
  originalPolicyId: string;
  newInsurer: string;
  newPremium: number;
  newDeductible: number;
  newCoverageHighlights: string[];
  savingsAmount: number;
}

export interface Commission {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: CommissionType;
  status: CommissionStatus;
  source: string; // e.g. "Police AX-992", "Hypothek M1"
  partnerName: string;
  description: string;
  // Agent Logic
  agentId?: string; // Who closed this?
  agentSplitPercentage?: number; // e.g. 0.70 (70%)
}

export type EmailPriority = 'HIGH' | 'NORMAL' | 'LOW';
export type EmailCategory = 'GENERAL' | 'CLAIMS' | 'SALES' | 'ADMIN' | 'INVOICE';

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  content: string; // HTML allowed
  date: Date;
  isRead: boolean;
  folder: 'INBOX' | 'SENT' | 'ARCHIVE' | 'TRASH';
  relatedClientId?: string; // Links email to a client in DB
  relatedPolicyId?: string; // Specific link to a policy
  relatedMortgageId?: string; // Specific link to a mortgage
  attachments?: { name: string, type: string }[];
  source: 'OUTLOOK' | 'GMAIL' | 'SYSTEM';
  
  // New Productivity Features
  priority: EmailPriority;
  tags: string[]; // e.g. ["Wichtig", "Wiedervorlage"]
  snoozedUntil?: Date | null; // If date > now, hide from Inbox
  category?: EmailCategory;
  aiAnalysis?: {
      summary: string;
      sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
      suggestedNextSteps: string[];
  }
}

// Call Agent Types
export interface CallScript {
    id: string;
    title: string;
    goal: string; // e.g. "Book Demo"
    openingLine: string;
    objectionHandlers: { objection: string, response: string }[];
}

export interface CallLog {
    id: string;
    leadId: string;
    date: Date;
    durationSeconds: number;
    outcome: 'BOOKED_DEMO' | 'NOT_INTERESTED' | 'CALLBACK' | 'VOICEMAIL';
    transcript: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}