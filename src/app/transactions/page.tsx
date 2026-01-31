"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, ArrowLeft, Eye } from "lucide-react";
import { useTransactions } from "@/lib/hooks/useTransactions";

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

export default function TransactionsPage() {
  const { transactions, isLoading, error, deleteTransaction } =
    useTransactions();
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "void":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "posted":
        return "Posted";
      case "draft":
        return "Draft";
      case "void":
        return "Void";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "journal":
        return "Journal Entry";
      case "income":
        return "Income";
      case "expense":
        return "Expense";
      case "invoice":
        return "Invoice";
      case "payment":
        return "Payment";
      default:
        return type;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const result = await deleteTransaction(id);
      if (!result.success) {
        alert(result.error || "Failed to delete transaction");
      }
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Transactions
                </h1>
              </div>
              <p className="text-gray-600">
                View and manage all accounting transactions
              </p>
            </div>
            <Link href="/transactions/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Transactions ({filteredTransactions.length})
            </CardTitle>
            <CardDescription>
              Complete history of all accounting transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading transactions...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Transaction #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">
                            {transaction.transactionNumber}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">
                            {formatDate(transaction.transactionDate)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">
                            {transaction.description}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-600">
                            {transaction.reference || "-"}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {getTypeLabel(transaction.type)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(transaction.totalAmount)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            <div className={`flex items-center space-x-1`}>
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(
                                  transaction.status,
                                )}`}
                              />
                              <span>{getStatusLabel(transaction.status)}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link href={`/transactions/${transaction.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {transaction.status === "draft" && (
                              <Link
                                href={`/transactions/${transaction.id}/edit`}
                              >
                                <Button size="sm">Edit</Button>
                              </Link>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
