import { useState, useEffect } from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  balance: number;
  status: string;
  businessId: string;
  totalInvoices: number;
  paidInvoices: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCustomers(data.data);
      } else {
        setError("Failed to fetch customers");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (customerData: any) => {
    try {
      setError(null);

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCustomers((prev) => [...prev, data.data]);
        return { success: true, data: data.data };
      } else {
        setError("Failed to create customer");
        return { success: false, error: "Failed to create customer" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateCustomer = async (id: string, customerData: any) => {
    try {
      setError(null);

      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCustomers((prev) => prev.map((c) => (c.id === id ? data.data : c)));
        return { success: true, data: data.data };
      } else {
        setError("Failed to update customer");
        return { success: false, error: "Failed to update customer" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        return { success: true };
      } else {
        setError("Failed to delete customer");
        return { success: false, error: "Failed to delete customer" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
