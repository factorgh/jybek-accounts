// API Client for making HTTP requests to our backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Authentication
  async login(email: string, password: string) {
    return this.post<{ success: boolean; user: any; token: string }>(
      "/auth/login",
      {
        email,
        password,
      },
    );
  }

  async register(userData: any) {
    return this.post<{ success: boolean; user: any }>(
      "/auth/register",
      userData,
    );
  }

  // Transactions
  async getTransactions() {
    return this.get<{ success: boolean; data: any[] }>("/transactions");
  }

  async createTransaction(transactionData: any) {
    return this.post<{ success: boolean; data: any }>(
      "/transactions",
      transactionData,
    );
  }

  async updateTransaction(id: string, transactionData: any) {
    return this.put<{ success: boolean; data: any }>(
      `/transactions/${id}`,
      transactionData,
    );
  }

  async deleteTransaction(id: string) {
    return this.delete<{ success: boolean }>(`/transactions/${id}`);
  }

  // Customers
  async getCustomers() {
    return this.get<{ success: boolean; data: any[] }>("/customers");
  }

  async createCustomer(customerData: any) {
    return this.post<{ success: boolean; data: any }>(
      "/customers",
      customerData,
    );
  }

  async updateCustomer(id: string, customerData: any) {
    return this.put<{ success: boolean; data: any }>(
      `/customers/${id}`,
      customerData,
    );
  }

  async deleteCustomer(id: string) {
    return this.delete<{ success: boolean }>(`/customers/${id}`);
  }

  // Chart of Accounts
  async getAccounts() {
    return this.get<{ success: boolean; data: any[] }>("/chart-of-accounts");
  }

  async createAccount(accountData: any) {
    return this.post<{ success: boolean; data: any }>(
      "/chart-of-accounts",
      accountData,
    );
  }

  async updateAccount(id: string, accountData: any) {
    return this.put<{ success: boolean; data: any }>(
      `/chart-of-accounts/${id}`,
      accountData,
    );
  }

  async deleteAccount(id: string) {
    return this.delete<{ success: boolean }>(`/chart-of-accounts/${id}`);
  }

  // Invoices
  async getInvoices() {
    return this.get<any[]>("/invoices");
  }

  async createInvoice(invoiceData: any) {
    return this.post<any>("/invoices", invoiceData);
  }

  async updateInvoice(id: string, invoiceData: any) {
    return this.put<any>(`/invoices/${id}`, invoiceData);
  }

  async deleteInvoice(id: string) {
    return this.delete<any>(`/invoices/${id}`);
  }

  // Bulk Upload
  async uploadBulkData(type: string, data: any[]) {
    return this.post<any>(`/bulk-upload/${type}`, { data });
  }

  // Financial Statements
  async getTrialBalance(period?: string) {
    const query = period ? `?period=${period}` : "";
    return this.get<any>(`/financial-statements/trial-balance${query}`);
  }

  async getProfitLoss(period?: string) {
    const query = period ? `?period=${period}` : "";
    return this.get<any>(`/financial-statements/profit-loss${query}`);
  }

  // QuickBooks Features
  async getReports() {
    return this.get<any[]>("/reports");
  }

  async getBudgets() {
    return this.get<any[]>("/budgeting");
  }

  async createBudget(budgetData: any) {
    return this.post<any>("/budgeting", budgetData);
  }

  async getInventory() {
    return this.get<any[]>("/inventory");
  }

  async createInventoryItem(itemData: any) {
    return this.post<any>("/inventory/items", itemData);
  }

  async getBankAccounts() {
    return this.get<any[]>("/bank/accounts");
  }

  async createBankAccount(accountData: any) {
    return this.post<any>("/bank/accounts", accountData);
  }

  async getTaxJurisdictions() {
    return this.get<any[]>("/tax/jurisdictions");
  }

  async createTaxJurisdiction(jurisdictionData: any) {
    return this.post<any>("/tax/jurisdictions", jurisdictionData);
  }

  async getFixedAssets() {
    return this.get<any[]>("/fixed-assets/assets");
  }

  async createFixedAsset(assetData: any) {
    return this.post<any>("/fixed-assets/assets", assetData);
  }

  // Seed Data
  async seedDatabase() {
    return this.post<any>("/seed");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
