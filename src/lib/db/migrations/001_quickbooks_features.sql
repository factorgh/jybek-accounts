-- QuickBooks Features Database Migration
-- Version: 001
-- Description: Create tables for Advanced Reporting, Budgeting, Inventory, Bank Reconciliation, Tax Management, and Fixed Assets

-- ==================== ADVANCED REPORTING ====================

-- Report Templates
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Generated Reports
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  template_id UUID REFERENCES report_templates(id),
  report_name VARCHAR(255) NOT NULL,
  report_data JSONB NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- cash_flow, aged_receivables, aged_payables, budget_variance, custom
  report_period JSONB NOT NULL, -- {startDate, endDate}
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by UUID REFERENCES users(id),
  file_path VARCHAR(500), -- For exported reports
  file_size BIGINT
);

-- Report Schedules
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  template_id UUID REFERENCES report_templates(id),
  schedule_name VARCHAR(255) NOT NULL,
  schedule_config JSONB NOT NULL, -- {frequency, day_of_month, time, recipients}
  next_run_at TIMESTAMP,
  last_run_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ==================== BUDGETING & FORECASTING ====================

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  budget_name VARCHAR(255) NOT NULL,
  budget_type VARCHAR(20) NOT NULL CHECK (budget_type IN ('annual', 'quarterly', 'monthly', 'project')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'archived')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Budget Lines
CREATE TABLE budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  budgeted_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  variance DECIMAL(15,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
  variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN budgeted_amount > 0 THEN (actual_amount - budgeted_amount) / budgeted_amount * 100 ELSE 0 END) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget Categories
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES budget_categories(id),
  account_ids TEXT[], -- Array of account IDs
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forecasts
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  base_budget_id UUID REFERENCES budgets(id),
  forecast_name VARCHAR(255) NOT NULL,
  forecast_period VARCHAR(20) NOT NULL CHECK (forecast_period IN ('monthly', 'quarterly', 'annual')),
  assumptions JSONB NOT NULL, -- {growthRate, inflationRate, marketConditions, customAssumptions}
  confidence_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Forecast Lines
CREATE TABLE forecast_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  forecasted_amount DECIMAL(15,2) NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.50,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budget Scenarios
CREATE TABLE budget_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  budget_id UUID REFERENCES budgets(id),
  scenario_name VARCHAR(255) NOT NULL,
  scenario_type VARCHAR(20) NOT NULL CHECK (scenario_type IN ('optimistic', 'pessimistic', 'realistic', 'custom')),
  assumptions JSONB NOT NULL, -- {revenueGrowth, costIncrease, marketFactors, customFactors}
  results JSONB, -- {projectedRevenue, projectedExpenses, projectedProfit, keyMetrics}
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ==================== INVENTORY MANAGEMENT ====================

-- Inventory Categories
CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES inventory_categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES inventory_categories(id),
  unit_of_measure VARCHAR(20) NOT NULL,
  cost_method VARCHAR(20) NOT NULL CHECK (cost_method IN ('fifo', 'lifo', 'weighted_average', 'specific_identification')),
  current_stock DECIMAL(15,3) DEFAULT 0,
  reorder_point DECIMAL(15,3),
  max_stock DECIMAL(15,3),
  unit_cost DECIMAL(15,2) DEFAULT 0,
  selling_price DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Stock Levels (for tracking current quantities by location)
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  warehouse_location VARCHAR(100) DEFAULT 'Main',
  quantity_on_hand DECIMAL(15,3) DEFAULT 0,
  quantity_reserved DECIMAL(15,3) DEFAULT 0,
  quantity_available DECIMAL(15,3) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  last_updated TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  UNIQUE(item_id, warehouse_location)
);

-- Inventory Movements
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
  quantity DECIMAL(15,3) NOT NULL,
  unit_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  reference_type VARCHAR(50), -- PURCHASE, SALE, ADJUSTMENT, TRANSFER, RETURN
  reference_id UUID,
  movement_date DATE NOT NULL,
  warehouse_location VARCHAR(100) DEFAULT 'Main',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Inventory Valuations
CREATE TABLE inventory_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  valuation_date DATE NOT NULL,
  valuation_method VARCHAR(20) NOT NULL CHECK (valuation_method IN ('fifo', 'lifo', 'weighted_average', 'specific_identification')),
  total_value DECIMAL(15,2) NOT NULL,
  item_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Reorder Rules
CREATE TABLE reorder_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  reorder_point DECIMAL(15,3) NOT NULL,
  reorder_quantity DECIMAL(15,3) NOT NULL,
  lead_time_days INTEGER NOT NULL,
  safety_stock DECIMAL(15,3) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ==================== BANK RECONCILIATION ====================

-- Bank Accounts
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'business', 'credit_card')),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  last_reconciliation_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Bank Statements
CREATE TABLE bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  statement_date DATE NOT NULL,
  opening_balance DECIMAL(15,2) NOT NULL,
  closing_balance DECIMAL(15,2) NOT NULL,
  statement_lines JSONB NOT NULL, -- Array of statement line objects
  import_source VARCHAR(50) DEFAULT 'manual' CHECK (import_source IN ('manual', 'file_import', 'api')),
  file_name VARCHAR(255),
  imported_at TIMESTAMP DEFAULT NOW(),
  imported_by UUID REFERENCES users(id)
);

-- Reconciliation Matches
CREATE TABLE reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES bank_statements(id),
  statement_line_index INTEGER NOT NULL, -- Index in the statement_lines array
  transaction_id UUID REFERENCES transactions(id),
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('auto', 'manual', 'rule_based')),
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  matched_by UUID REFERENCES users(id),
  matched_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Reconciliation Rules
CREATE TABLE reconciliation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  rule_name VARCHAR(255) NOT NULL,
  rule_conditions JSONB NOT NULL, -- Array of condition objects
  match_criteria JSONB NOT NULL, -- {amountTolerance, dateTolerance, descriptionKeywords, accountMappings}
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Reconciliation Variances
CREATE TABLE reconciliation_variances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID, -- Reference to the reconciliation session
  variance_type VARCHAR(50) NOT NULL CHECK (variance_type IN ('amount_difference', 'missing_transaction', 'duplicate_transaction', 'timing_difference')),
  amount DECIMAL(15,2),
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== TAX MANAGEMENT ====================

-- Tax Jurisdictions
CREATE TABLE tax_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_code VARCHAR(10) NOT NULL UNIQUE, -- US, CA, EU, etc.
  jurisdiction_name VARCHAR(255) NOT NULL,
  tax_authority VARCHAR(255),
  filing_frequency VARCHAR(20) NOT NULL CHECK (filing_frequency IN ('monthly', 'quarterly', 'annual', 'semi_annual')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax Rates
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES tax_jurisdictions(id),
  tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('sales', 'income', 'vat', 'gst', 'withholding', 'payroll', 'property')),
  rate_percentage DECIMAL(5,4) NOT NULL,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax Codes
CREATE TABLE tax_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  tax_rate_id UUID REFERENCES tax_rates(id),
  is_recoverable BOOLEAN DEFAULT TRUE,
  gl_account_id UUID REFERENCES accounts(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tax Returns
CREATE TABLE tax_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  jurisdiction_id UUID NOT NULL REFERENCES tax_jurisdictions(id),
  return_period VARCHAR(20) NOT NULL, -- Format: YYYY-MM for monthly, YYYY-QQ for quarterly
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  total_taxable_amount DECIMAL(15,2) NOT NULL,
  total_tax_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready_to_file', 'filed', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  filed_date DATE,
  paid_date DATE,
  filing_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tax Payments
CREATE TABLE tax_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  tax_return_id UUID REFERENCES tax_returns(id),
  payment_amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tax Liabilities
CREATE TABLE tax_liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('sales', 'income', 'vat', 'gst', 'withholding', 'payroll', 'property')),
  jurisdiction_id UUID REFERENCES tax_jurisdictions(id),
  liability_amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== FIXED ASSETS ====================

-- Asset Categories
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  depreciation_method VARCHAR(20) NOT NULL CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production')),
  useful_life_years INTEGER NOT NULL,
  ifrs_classification VARCHAR(50) CHECK (ifrs_classification IN ('ppe', 'intangible', 'investment_property', 'biological_assets')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fixed Assets Register
CREATE TABLE fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  asset_number VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES asset_categories(id),
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(15,2) NOT NULL,
  depreciation_method VARCHAR(20) NOT NULL CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production')),
  useful_life_years INTEGER NOT NULL,
  residual_value DECIMAL(15,2) DEFAULT 0,
  current_location VARCHAR(255),
  responsible_person VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'under_construction', 'disposed', 'impaired', 'retired')),
  ifrs_classification VARCHAR(50) CHECK (ifrs_classification IN ('ppe', 'intangible', 'investment_property', 'biological_assets')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Depreciation Schedules
CREATE TABLE depreciation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  opening_carrying_amount DECIMAL(15,2) NOT NULL,
  depreciation_expense DECIMAL(15,2) NOT NULL,
  closing_carrying_amount DECIMAL(15,2) NOT NULL,
  accumulated_depreciation DECIMAL(15,2) NOT NULL,
  calculation_date DATE NOT NULL,
  calculated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id, fiscal_year)
);

-- Impairment Tests
CREATE TABLE impairment_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id),
  test_date DATE NOT NULL,
  carrying_amount DECIMAL(15,2) NOT NULL,
  recoverable_amount DECIMAL(15,2) NOT NULL,
  impairment_loss DECIMAL(15,2) GENERATED ALWAYS AS (GREATEST(carrying_amount - recoverable_amount, 0)) STORED,
  test_method VARCHAR(50) NOT NULL CHECK (test_method IN ('fair_value_less_costs', 'value_in_use')),
  test_details JSONB, -- Additional test data and calculations
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Asset Disposals
CREATE TABLE asset_disposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id),
  disposal_date DATE NOT NULL,
  disposal_method VARCHAR(50) NOT NULL CHECK (disposal_method IN ('sale', 'scrap', 'trade_in', 'donation')),
  proceeds_amount DECIMAL(15,2),
  disposal_costs DECIMAL(15,2) DEFAULT 0,
  gain_loss_on_disposal DECIMAL(15,2),
  buyer_name VARCHAR(255),
  disposal_reference VARCHAR(100),
  disposed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Asset Revaluations
CREATE TABLE asset_revaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES fixed_assets(id),
  revaluation_date DATE NOT NULL,
  previous_carrying_amount DECIMAL(15,2) NOT NULL,
  revalued_amount DECIMAL(15,2) NOT NULL,
  revaluation_surplus DECIMAL(15,2) GENERATED ALWAYS AS (revalued_amount - previous_carrying_amount) STORED,
  valuation_method VARCHAR(100),
  valuer_name VARCHAR(255),
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Report Templates Indexes
CREATE INDEX idx_report_templates_business_id ON report_templates(business_id);
CREATE INDEX idx_generated_reports_business_id ON generated_reports(business_id);
CREATE INDEX idx_generated_reports_template_id ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX idx_report_schedules_business_id ON report_schedules(business_id);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = true;

-- Budgeting Indexes
CREATE INDEX idx_budgets_business_id ON budgets(business_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budget_lines_budget_id ON budget_lines(budget_id);
CREATE INDEX idx_budget_lines_account_id ON budget_lines(account_id);
CREATE INDEX idx_forecasts_business_id ON forecasts(business_id);
CREATE INDEX idx_forecast_lines_forecast_id ON forecast_lines(forecast_id);
CREATE INDEX idx_budget_scenarios_budget_id ON budget_scenarios(budget_id);

-- Inventory Indexes
CREATE INDEX idx_inventory_items_business_id ON inventory_items(business_id);
CREATE INDEX idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active) WHERE is_active = true;
CREATE INDEX idx_stock_levels_item_id ON stock_levels(item_id);
CREATE INDEX idx_stock_levels_location ON stock_levels(warehouse_location);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_reorder_rules_item_id ON reorder_rules(item_id);

-- Bank Reconciliation Indexes
CREATE INDEX idx_bank_accounts_business_id ON bank_accounts(business_id);
CREATE INDEX idx_bank_statements_account_id ON bank_statements(bank_account_id);
CREATE INDEX idx_bank_statements_date ON bank_statements(statement_date);
CREATE INDEX idx_reconciliation_matches_statement_id ON reconciliation_matches(statement_id);
CREATE INDEX idx_reconciliation_matches_transaction_id ON reconciliation_matches(transaction_id);
CREATE INDEX idx_reconciliation_rules_business_id ON reconciliation_rules(business_id);
CREATE INDEX idx_reconciliation_rules_priority ON reconciliation_rules(priority DESC) WHERE is_active = true;

-- Tax Management Indexes
CREATE INDEX idx_tax_codes_business_id ON tax_codes(business_id);
CREATE INDEX idx_tax_codes_active ON tax_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_tax_returns_business_id ON tax_returns(business_id);
CREATE INDEX idx_tax_returns_jurisdiction_id ON tax_returns(jurisdiction_id);
CREATE INDEX idx_tax_returns_status ON tax_returns(status);
CREATE INDEX idx_tax_returns_due_date ON tax_returns(due_date);
CREATE INDEX idx_tax_liabilities_business_id ON tax_liabilities(business_id);
CREATE INDEX idx_tax_liabilities_due_date ON tax_liabilities(due_date) WHERE is_paid = false;

-- Fixed Assets Indexes
CREATE INDEX idx_fixed_assets_business_id ON fixed_assets(business_id);
CREATE INDEX idx_fixed_assets_category_id ON fixed_assets(category_id);
CREATE INDEX idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX idx_depreciation_schedules_asset_id ON depreciation_schedules(asset_id);
CREATE INDEX idx_depreciation_schedules_fiscal_year ON depreciation_schedules(fiscal_year);
CREATE INDEX idx_impairment_tests_asset_id ON impairment_tests(asset_id);
CREATE INDEX idx_impairment_tests_date ON impairment_tests(test_date);
CREATE INDEX idx_asset_disposals_asset_id ON asset_disposals(asset_id);
CREATE INDEX idx_asset_disposals_date ON asset_disposals(disposal_date);

-- ==================== TRIGGERS AND CONSTRAINTS ====================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_lines_updated_at BEFORE UPDATE ON budget_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reconciliation_rules_updated_at BEFORE UPDATE ON reconciliation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fixed_assets_updated_at BEFORE UPDATE ON fixed_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock levels update trigger
CREATE OR REPLACE FUNCTION update_stock_level_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_levels_last_updated BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_stock_level_last_updated();

-- ==================== VIEWS FOR COMMON QUERIES ====================

-- Budget Summary View
CREATE VIEW budget_summary AS
SELECT 
    b.id,
    b.business_id,
    b.budget_name,
    b.budget_type,
    b.start_date,
    b.end_date,
    b.total_budget,
    b.status,
    COALESCE(SUM(bl.actual_amount), 0) as total_actual,
    COALESCE(SUM(bl.budgeted_amount), 0) as total_budgeted,
    COALESCE(SUM(bl.actual_amount), 0) - COALESCE(SUM(bl.budgeted_amount), 0) as total_variance,
    CASE 
        WHEN COALESCE(SUM(bl.budgeted_amount), 0) > 0 
        THEN ((COALESCE(SUM(bl.actual_amount), 0) - COALESCE(SUM(bl.budgeted_amount), 0)) / COALESCE(SUM(bl.budgeted_amount), 0)) * 100 
        ELSE 0 
    END as variance_percentage
FROM budgets b
LEFT JOIN budget_lines bl ON b.id = bl.budget_id
GROUP BY b.id, b.business_id, b.budget_name, b.budget_type, b.start_date, b.end_date, b.total_budget, b.status;

-- Inventory Summary View
CREATE VIEW inventory_summary AS
SELECT 
    ii.id,
    ii.business_id,
    ii.item_code,
    ii.description,
    ii.current_stock,
    ii.unit_cost,
    ii.selling_price,
    ii.current_stock * ii.unit_cost as total_value,
    COALESCE(sl.quantity_available, ii.current_stock) as available_stock,
    rr.reorder_point,
    CASE 
        WHEN rr.reorder_point IS NOT NULL AND COALESCE(sl.quantity_available, ii.current_stock) <= rr.reorder_point 
        THEN true 
        ELSE false 
    END as needs_reorder
FROM inventory_items ii
LEFT JOIN stock_levels sl ON ii.id = sl.item_id AND sl.warehouse_location = 'Main'
LEFT JOIN reorder_rules rr ON ii.id = rr.item_id AND rr.is_active = true
WHERE ii.is_active = true;

-- Fixed Asset Summary View
CREATE VIEW asset_summary AS
SELECT 
    fa.id,
    fa.business_id,
    fa.asset_number,
    fa.description,
    fa.acquisition_cost,
    fa.acquisition_date,
    fa.status,
    COALESCE(ds.accumulated_depreciation, 0) as accumulated_depreciation,
    fa.acquisition_cost - COALESCE(ds.accumulated_depreciation, 0) as net_book_value,
    fa.useful_life_years,
    EXTRACT(YEAR FROM AGE(NOW(), fa.acquisition_date)) as age_in_years
FROM fixed_assets fa
LEFT JOIN LATERAL (
    SELECT asset_id, SUM(accumulated_depreciation) as accumulated_depreciation
    FROM depreciation_schedules 
    WHERE asset_id = fa.id 
    GROUP BY asset_id
) ds ON true;

-- Tax Liability Summary View
CREATE VIEW tax_liability_summary AS
SELECT 
    tl.id,
    tl.business_id,
    tl.tax_type,
    tj.jurisdiction_name,
    tl.liability_amount,
    tl.paid_amount,
    tl.liability_amount - tl.paid_amount as outstanding_amount,
    tl.due_date,
    tl.is_paid,
    CASE 
        WHEN tl.due_date < NOW() AND tl.is_paid = false THEN true 
        ELSE false 
    END as is_overdue
FROM tax_liabilities tl
JOIN tax_jurisdictions tj ON tl.jurisdiction_id = tj.id;
