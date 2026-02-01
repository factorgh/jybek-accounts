"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Building,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  balance: number;
  isActive: boolean;
  description?: string;
  parentCode?: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditAccountPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "asset" as "asset" | "liability" | "equity" | "income" | "expense",
    description: "",
    parentCode: "",
    balance: 0,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccount();
  }, [params.id]);

  const fetchAccount = async () => {
    try {
      const response = await fetch(`/api/chart-of-accounts/${params.id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAccount(data.data);
        setFormData({
          code: data.data.code,
          name: data.data.name,
          type: data.data.type,
          description: data.data.description || "",
          parentCode: data.data.parentCode || "",
          balance: data.data.balance,
          isActive: data.data.isActive,
        });
      } else {
        setError("Failed to fetch account");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/chart-of-accounts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        alert("Account updated successfully!");
        router.push(`/chart-of-accounts/${params.id}`);
      } else {
        setError("Failed to update account");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "asset":
        return <Building className="h-5 w-5" />;
      case "liability":
        return <CreditCard className="h-5 w-5" />;
      case "equity":
        return <PiggyBank className="h-5 w-5" />;
      case "income":
        return <TrendingUp className="h-5 w-5" />;
      case "expense":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
            <Link href="/chart-of-accounts">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chart of Accounts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">
              Account Not Found
            </h1>
            <Link href="/chart-of-accounts">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chart of Accounts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
            <Link href={`/chart-of-accounts/${params.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Edit Account
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Update account information and settings
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(formData.type)}
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Update the account's basic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Account Code *
                      </label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Account Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Cash and Cash Equivalents"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Account Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Account description and purpose"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="parentCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Parent Account Code
                    </label>
                    <input
                      type="text"
                      id="parentCode"
                      name="parentCode"
                      value={formData.parentCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Settings</CardTitle>
                  <CardDescription>
                    Update balance and status information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="balance"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Balance
                    </label>
                    <input
                      type="number"
                      id="balance"
                      name="balance"
                      value={formData.balance}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Account is active
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={isSaving || !formData.code || !formData.name}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Link href={`/chart-of-accounts/${params.id}`}>
                      <Button variant="outline" className="w-full">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Account Type Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Type Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(formData.type)}
                      <span className="font-medium">
                        {formData.type.charAt(0).toUpperCase() +
                          formData.type.slice(1)}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      <p>
                        Normal Balance:{" "}
                        {formData.type === "asset" ||
                        formData.type === "expense"
                          ? "Debit"
                          : "Credit"}
                      </p>
                      <p>
                        Statement:{" "}
                        {formData.type === "asset" ||
                        formData.type === "liability" ||
                        formData.type === "equity"
                          ? "Balance Sheet"
                          : "Income Statement"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Use standard numbering conventions</p>
                    <p>• Keep descriptions clear and concise</p>
                    <p>• Group related accounts together</p>
                    <p>• Review existing accounts before editing</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
