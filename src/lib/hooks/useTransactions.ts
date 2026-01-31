import { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";

interface Transaction {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  description: string;
  reference?: string;
  type: string;
  totalAmount: number;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getTransactions();

      if (response.success) {
        setTransactions(response.data as Transaction[]);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: any) => {
    try {
      setError(null);

      const response = await apiClient.createTransaction(transactionData);

      if (response.success) {
        setTransactions((prev) => [...prev, response.data as Transaction]);
        return { success: true, data: response.data as Transaction };
      } else {
        setError("Failed to create transaction");
        return { success: false, error: "Failed to create transaction" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateTransaction = async (id: string, transactionData: any) => {
    try {
      setError(null);

      const response = await apiClient.updateTransaction(id, transactionData);

      if (response.success) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? (response.data as Transaction) : t)),
        );
        return { success: true, data: response.data as Transaction };
      } else {
        setError("Failed to update transaction");
        return { success: false, error: "Failed to update transaction" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError(null);

      const response = await apiClient.deleteTransaction(id);

      if (response.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return { success: true };
      } else {
        setError("Failed to delete transaction");
        return { success: false, error: "Failed to delete transaction" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
