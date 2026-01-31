export interface User {
  _id?: string;
  email: string;
  name: string;
  businessId: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  fiscalYearStart: Date;
  openingBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  _id?: string;
  businessId: string;
  code: string;
  name: string;
  type: AccountType;
  isActive: boolean;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  Asset = "asset",
  Liability = "liability",
  Equity = "equity",
  Income = "income",
  Expense = "expense",
}

export interface Transaction {
  _id?: string;
  businessId: string;
  transactionNumber: string;
  transactionDate: Date;
  description: string;
  reference?: string;
  type: TransactionType;
  isReversed: boolean;
  reversedByTransactionId?: string;
  createdByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
  lines?: TransactionLine[];
}

export enum TransactionType {
  ManualJournal = "manual_journal",
  Income = "income",
  Expense = "expense",
  Invoice = "invoice",
  InvoicePayment = "invoice_payment",
  OpeningBalance = "opening_balance",
}

export interface TransactionLine {
  _id?: string;
  transactionId: string;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  createdAt: Date;
}

export interface Customer {
  _id?: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  _id?: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  _id?: string;
  businessId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: InvoiceItem[];
}

export enum InvoiceStatus {
  Draft = "draft",
  Sent = "sent",
  Paid = "paid",
  Cancelled = "cancelled",
}

export interface InvoiceItem {
  _id?: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  accountId?: string;
}

export interface Quotation {
  _id?: string;
  businessId: string;
  customerId: string;
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items?: QuotationItem[];
}

export enum QuotationStatus {
  Draft = "draft",
  Sent = "sent",
  Accepted = "accepted",
  Rejected = "rejected",
  Expired = "expired",
  ConvertedToInvoice = "converted_to_invoice",
}

export interface QuotationItem {
  _id?: string;
  quotationId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  amount: number;
}

export interface RecurringTransaction {
  _id?: string;
  businessId: string;
  name: string;
  description?: string;
  frequency: RecurrenceFrequency;
  frequencyInterval: number;
  startDate: Date;
  endDate?: Date;
  nextRunDate?: Date;
  lastRunDate?: Date;
  isActive: boolean;
  timesRun: number;
  maxOccurrences?: number;
  transactionType: TransactionType;
  amount: number;
  debitAccountId: string;
  creditAccountId: string;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum RecurrenceFrequency {
  Daily = "daily",
  Weekly = "weekly",
  BiWeekly = "bi_weekly",
  Monthly = "monthly",
  Quarterly = "quarterly",
  Annually = "annually",
}

export interface BankReconciliation {
  _id?: string;
  businessId: string;
  bankAccountId: string;
  statementDate: Date;
  reconciliationDate: Date;
  statementOpeningBalance: number;
  statementClosingBalance: number;
  bookOpeningBalance: number;
  bookClosingBalance: number;
  status: BankReconciliationStatus;
  depositsInTransit: number;
  outstandingChecks: number;
  bankCharges: number;
  bankInterest: number;
  otherAdjustments: number;
  notes?: string;
  reconciledByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
  statementLines?: BankStatementLine[];
}

export enum BankReconciliationStatus {
  Draft = "draft",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
}

export interface BankStatementLine {
  _id?: string;
  bankReconciliationId: string;
  transactionDate: Date;
  valueDate?: Date;
  description: string;
  reference?: string;
  checkNumber?: string;
  debit: number;
  credit: number;
  balance: number;
  status: BankStatementLineStatus;
  matchedTransactionId?: string;
  matchedTransactionLineId?: string;
  matchedAt?: Date;
  lineType: BankStatementLineType;
  createdAt: Date;
}

export enum BankStatementLineStatus {
  Unmatched = "unmatched",
  Matched = "matched",
  Reconciled = "reconciled",
  Excluded = "excluded",
}

export enum BankStatementLineType {
  Deposit = "deposit",
  Withdrawal = "withdrawal",
  Check = "check",
  Transfer = "transfer",
  BankCharge = "bank_charge",
  Interest = "interest",
  Other = "other",
}

export interface ApiClient {
  _id?: string;
  businessId: string;
  name: string;
  apiKey: string;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  _id?: string;
  businessId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
