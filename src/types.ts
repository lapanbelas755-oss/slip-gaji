export enum Role {
  LEAD_PHOTOGRAPHER = "Lead Photographer",
  ASSISTANT_PHOTOGRAPHER = "Assistant Photographer",
  VIDEOGRAPHER = "Videographer",
  EDITOR = "Editor",
  LIGHTMAN = "Lightman/Crew",
  FREELANCE_PHOTOGRAPHER = "Freelance Photographer"
}

export enum PayslipStatus {
  DRAFT = "Draft",
  PAID = "Lunas (Paid)",
  EMAILED = "Terkirim (Emailed)"
}

export interface Photographer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  baseSalary: number; // Retainer/Month (if any)
  isActive: boolean;
  rates?: Record<string, number>; // Event Type -> Rate (Rp)
}

export interface SessionWorked {
  id: string;
  date: string;
  dates?: string[];
  clientName: string;
  eventType: string; // e.g., Wedding, Pre-Wedding, Product Shoot
  role: string;
  fee: number;
  feeMode?: "PER_DAY" | "TOTAL_PROJECT";
}

export interface AllowanceItem {
  id: string;
  name: string;
  amount: number;
}

export interface DeductionItem {
  id: string;
  name: string;
  amount: number;
}

export interface Payslip {
  id: string;
  photographerId: string;
  photographerName: string;
  photographerEmail: string;
  photographerRole: Role;
  
  // Multi-date support
  month: string; // YYYY-MM
  paymentDate: string; // YYYY-MM-DD (support more than 1 payment date in the same month)
  periodStart: string;
  periodEnd: string;

  // Earnings details
  baseSalary: number;
  sessions: SessionWorked[];
  allowances: AllowanceItem[];
  deductions: DeductionItem[];

  // Totals
  totalSessionsEarnings: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;

  status: PayslipStatus;
  note?: string;
  createdAt: string;
  emailSentAt?: string;
  
  // Bank information snapshot at generation time
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

export interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
  senderEmail: string;
}

export interface MailLog {
  id: string;
  payslipId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: "success" | "failed";
  error?: string;
  sentAt: string;
}

export const EVENT_CATEGORIES = [
  "Prewed Backup",
  "Prewed Solo",
  "Akad Only",
  "Akad Postwed",
  "Lamaran",
  "Tasyakuran",
  "Resepsi Backup",
  "Resepsi Solo Fighter",
  "Akad Resepsi 1 Hari"
];
