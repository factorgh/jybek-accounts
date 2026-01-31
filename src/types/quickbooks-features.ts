// QuickBooks Feature Types for Implementation

// ==================== ADVANCED REPORTING ====================

export interface CashFlowReport {
  id: string;
  businessId: string;
  reportPeriod: DateRange;
  operatingActivities: CashFlowItem[];
  investingActivities: CashFlowItem[];
  financingActivities: CashFlowItem[];
  netIncreaseInCash: number;
  cashAtBeginningOfPeriod: number;
  cashAtEndOfPeriod: number;
  generatedAt: Date;
}

export interface CashFlowItem {
  description: string;
  amount: number;
  category: string;
  accountId?: string;
  transactionId?: string;
}

export interface AgedReceivablesReport {
  id: string;
  businessId: string;
  asOfDate: Date;
  agingBuckets: AgedBucket[];
  totalOutstanding: number;
  currentAmount: number;
  overdueAmount: number;
}

export interface AgedPayablesReport {
  id: string;
  businessId: string;
  asOfDate: Date;
  agingBuckets: AgedBucket[];
  totalOutstanding: number;
  currentAmount: number;
  overdueAmount: number;
}

export interface AgedBucket {
  daysRange: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface BudgetVarianceReport {
  id: string;
  businessId: string;
  budgetId: string;
  reportPeriod: DateRange;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  lineItems: BudgetVarianceLine[];
}

export interface BudgetVarianceLine {
  accountId: string;
  accountName: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: "favorable" | "unfavorable" | "neutral";
}

export interface CustomReport {
  id: string;
  businessId: string;
  templateId: string;
  reportName: string;
  reportData: any;
  parameters: ReportParameters;
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportTemplate {
  id: string;
  businessId: string;
  name: string;
  description: string;
  templateConfig: TemplateConfig;
  isSystem: boolean;
  createdAt: Date;
}

export interface TemplateConfig {
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: SortConfig[];
  chartConfig?: ChartConfig;
}

export interface ReportColumn {
  field: string;
  label: string;
  type: "text" | "number" | "date" | "currency";
  format?: string;
  aggregation?: "sum" | "avg" | "count" | "min" | "max";
}

export interface ReportFilter {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "between";
  value: any;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "area";
  xAxis: string;
  yAxis: string;
  groupBy?: string;
}

export interface ReportParameters {
  dateRange: DateRange;
  filters: Record<string, any>;
  format?: "json" | "pdf" | "excel" | "csv";
}

// ==================== BUDGETING & FORECASTING ====================

export interface Budget {
  id: string;
  businessId: string;
  budgetName: string;
  budgetType: BudgetType;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  status: BudgetStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lines: BudgetLine[];
}

export enum BudgetType {
  ANNUAL = "annual",
  QUARTERLY = "quarterly",
  MONTHLY = "monthly",
  PROJECT = "project",
}

export enum BudgetStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  ARCHIVED = "archived",
}

export interface BudgetLine {
  id: string;
  budgetId: string;
  accountId: string;
  accountName: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  category: string;
}

export interface Forecast {
  id: string;
  businessId: string;
  baseBudgetId: string;
  forecastName: string;
  forecastPeriod: ForecastPeriod;
  assumptions: ForecastAssumptions;
  createdAt: Date;
  lines: ForecastLine[];
}

export enum ForecastPeriod {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
}

export interface ForecastAssumptions {
  growthRate: number;
  inflationRate: number;
  marketConditions: string;
  customAssumptions: Record<string, any>;
}

export interface ForecastLine {
  accountId: string;
  forecastedAmount: number;
  confidence: number;
  notes: string;
}

export interface BudgetCategory {
  id: string;
  businessId: string;
  name: string;
  description: string;
  parentId?: string;
  accountIds: string[];
}

export interface BudgetScenario {
  id: string;
  businessId: string;
  budgetId: string;
  scenarioName: string;
  scenarioType: ScenarioType;
  assumptions: ScenarioAssumptions;
  results: ScenarioResults;
  createdAt: Date;
}

export enum ScenarioType {
  OPTIMISTIC = "optimistic",
  PESSIMISTIC = "pessimistic",
  REALISTIC = "realistic",
  CUSTOM = "custom",
}

export interface ScenarioAssumptions {
  revenueGrowth: number;
  costIncrease: number;
  marketFactors: Record<string, number>;
  customFactors: Record<string, any>;
}

export interface ScenarioResults {
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  keyMetrics: Record<string, number>;
}

// ==================== INVENTORY MANAGEMENT ====================

export interface InventoryItem {
  id: string;
  businessId: string;
  itemCode: string;
  description: string;
  categoryId: string;
  unitOfMeasure: string;
  costMethod: CostMethod;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CostMethod {
  FIFO = "fifo",
  LIFO = "lifo",
  WEIGHTED_AVERAGE = "weighted_average",
  SPECIFIC_IDENTIFICATION = "specific_identification",
}

export interface InventoryCategory {
  id: string;
  businessId: string;
  name: string;
  description: string;
  parentId?: string;
  createdAt: Date;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType: ReferenceType;
  referenceId?: string;
  movementDate: Date;
  notes: string;
  createdAt: Date;
}

export enum MovementType {
  IN = "in",
  OUT = "out",
  ADJUSTMENT = "adjustment",
  TRANSFER = "transfer",
}

export enum ReferenceType {
  PURCHASE = "purchase",
  SALE = "sale",
  ADJUSTMENT = "adjustment",
  TRANSFER = "transfer",
  RETURN = "return",
}

export interface StockLevel {
  id: string;
  itemId: string;
  warehouseLocation: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lastUpdated: Date;
}

export interface InventoryValuation {
  id: string;
  businessId: string;
  valuationDate: Date;
  valuationMethod: CostMethod;
  totalValue: number;
  itemValuations: ItemValuation[];
}

export interface ItemValuation {
  itemId: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
}

export interface ReorderRule {
  id: string;
  businessId: string;
  itemId: string;
  reorderPoint: number;
  reorderQuantity: number;
  leadTimeDays: number;
  safetyStock: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ReorderSuggestion {
  itemId: string;
  itemCode: string;
  description: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
}

// ==================== BANK RECONCILIATION ====================

export interface BankAccount {
  id: string;
  businessId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: BankAccountType;
  currency: string;
  isActive: boolean;
  lastReconciliationDate?: Date;
  createdAt: Date;
}

export enum BankAccountType {
  CHECKING = "checking",
  SAVINGS = "savings",
  BUSINESS = "business",
  CREDIT_CARD = "credit_card",
}

export interface BankStatement {
  id: string;
  bankAccountId: string;
  statementDate: Date;
  openingBalance: number;
  closingBalance: number;
  statementLines: BankStatementLine[];
  importSource: ImportSource;
  importedAt: Date;
}

export enum ImportSource {
  MANUAL = "manual",
  FILE_IMPORT = "file_import",
  API = "api",
}

export interface BankStatementLine {
  id: string;
  transactionDate: Date;
  description: string;
  amount: number;
  balance: number;
  transactionType: "debit" | "credit";
  reference?: string;
  category?: string;
}

export interface ReconciliationMatch {
  id: string;
  statementId: string;
  statementLineId: string;
  transactionId: string;
  matchType: MatchType;
  confidenceScore: number;
  matchedBy: string;
  matchedAt: Date;
  notes?: string;
}

export enum MatchType {
  AUTO = "auto",
  MANUAL = "manual",
  RULE_BASED = "rule_based",
}

export interface ReconciliationRule {
  id: string;
  businessId: string;
  ruleName: string;
  ruleConditions: RuleCondition[];
  matchCriteria: MatchCriteria;
  priority: number;
  isActive: boolean;
  createdAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: any;
}

export interface MatchCriteria {
  amountTolerance: number;
  dateTolerance: number;
  descriptionKeywords: string[];
  accountMappings: Record<string, string>;
}

export interface ReconciliationVariance {
  id: string;
  reconciliationId: string;
  varianceType: VarianceType;
  amount: number;
  description: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum VarianceType {
  AMOUNT_DIFFERENCE = "amount_difference",
  MISSING_TRANSACTION = "missing_transaction",
  DUPLICATE_TRANSACTION = "duplicate_transaction",
  TIMING_DIFFERENCE = "timing_difference",
}

// ==================== TAX MANAGEMENT ====================

export interface TaxJurisdiction {
  id: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  taxAuthority: string;
  filingFrequency: FilingFrequency;
  isActive: boolean;
  createdAt: Date;
}

export enum FilingFrequency {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  SEMI_ANNUAL = "semi_annual",
}

export interface TaxRate {
  id: string;
  jurisdictionId: string;
  taxType: TaxType;
  ratePercentage: number;
  effectiveDate: Date;
  expiryDate?: Date;
  description: string;
  isActive: boolean;
}

export enum TaxType {
  SALES = "sales",
  INCOME = "income",
  VAT = "vat",
  GST = "gst",
  WITHHOLDING = "withholding",
  PAYROLL = "payroll",
  PROPERTY = "property",
}

export interface TaxCode {
  id: string;
  businessId: string;
  code: string;
  description: string;
  taxRateId: string;
  isRecoverable: boolean;
  glAccountId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TaxReturn {
  id: string;
  businessId: string;
  jurisdictionId: string;
  returnPeriod: string;
  periodStartDate: Date;
  periodEndDate: Date;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  status: TaxReturnStatus;
  dueDate: Date;
  filedDate?: Date;
  paidDate?: Date;
  createdAt: Date;
}

export enum TaxReturnStatus {
  DRAFT = "draft",
  READY_TO_FILE = "ready_to_file",
  FILED = "filed",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export interface TaxPayment {
  id: string;
  businessId: string;
  taxReturnId: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference: string;
  createdAt: Date;
}

export interface TaxLiability {
  id: string;
  businessId: string;
  taxType: TaxType;
  jurisdictionId: string;
  liabilityAmount: number;
  dueDate: Date;
  isPaid: boolean;
  createdAt: Date;
}

export interface TaxCalculation {
  taxableAmount: number;
  taxAmount: number;
  taxBreakdown: TaxComponent[];
  totalTax: number;
}

export interface TaxComponent {
  taxType: TaxType;
  jurisdictionId: string;
  rate: number;
  amount: number;
  isRecoverable: boolean;
}

// ==================== FIXED ASSETS ====================

export interface FixedAsset {
  id: string;
  businessId: string;
  assetNumber: string;
  description: string;
  categoryId: string;
  acquisitionDate: Date;
  acquisitionCost: number;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  residualValue: number;
  currentLocation: string;
  responsiblePerson: string;
  status: AssetStatus;
  ifrsClassification: IFRSAssetClassification;
  createdAt: Date;
  updatedAt: Date;
}

export enum DepreciationMethod {
  STRAIGHT_LINE = "straight_line",
  DECLINING_BALANCE = "declining_balance",
  SUM_OF_YEARS = "sum_of_years",
  UNITS_OF_PRODUCTION = "units_of_production",
}

export enum AssetStatus {
  ACTIVE = "active",
  UNDER_CONSTRUCTION = "under_construction",
  DISPOSED = "disposed",
  IMPAIRED = "impaired",
  RETIRED = "retired",
}

export enum IFRSAssetClassification {
  PPE = "ppe",
  INTANGIBLE = "intangible",
  INVESTMENT_PROPERTY = "investment_property",
  BIOLOGICAL_ASSETS = "biological_assets",
}

export interface AssetCategory {
  id: string;
  businessId: string;
  name: string;
  description: string;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  ifrsClassification: IFRSAssetClassification;
  createdAt: Date;
}

export interface DepreciationSchedule {
  id: string;
  assetId: string;
  fiscalYear: number;
  openingCarryingAmount: number;
  depreciationExpense: number;
  closingCarryingAmount: number;
  accumulatedDepreciation: number;
  calculationDate: Date;
}

export interface ImpairmentTest {
  id: string;
  assetId: string;
  testDate: Date;
  carryingAmount: number;
  recoverableAmount: number;
  impairmentLoss: number;
  testMethod: ImpairmentTestMethod;
  performedBy: string;
  createdAt: Date;
}

export enum ImpairmentTestMethod {
  FAIR_VALUE_LESS_COSTS = "fair_value_less_costs",
  VALUE_IN_USE = "value_in_use",
}

export interface AssetDisposal {
  id: string;
  assetId: string;
  disposalDate: Date;
  disposalMethod: DisposalMethod;
  proceedsAmount: number;
  disposalCosts: number;
  gainLossOnDisposal: number;
  disposedBy: string;
  createdAt: Date;
}

export enum DisposalMethod {
  SALE = "sale",
  SCRAP = "scrap",
  TRADE_IN = "trade_in",
  DONATION = "donation",
}

export interface AssetRevaluation {
  id: string;
  assetId: string;
  revaluationDate: Date;
  previousCarryingAmount: number;
  revaluedAmount: number;
  revaluationSurplus: number;
  performedBy: string;
  createdAt: Date;
}

// ==================== COMMON TYPES ====================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Business {
  id: string;
  name: string;
  taxId?: string;
  currency: string;
  fiscalYearEnd: Date;
}
