"use client";

import * as React from "react";
import { useState } from "react";
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
import { useChartOfAccounts } from "@/lib/hooks/useChartOfAccounts";

export default function CreateAccountPage() {
  const router = useRouter();
  const { createAccount } = useChartOfAccounts();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "asset",
    description: "",
    parentCode: "",
    balance: 0,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await createAccount(formData);

      if (result.success) {
        alert("Account created successfully!");
        router.push("/chart-of-accounts");
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "asset":
        return "Resources owned by the business (cash, inventory, equipment)";
      case "liability":
        return "Obligations of the business (loans, accounts payable)";
      case "equity":
        return "Owner's interest in the business";
      case "income":
        return "Revenue generated from business operations";
      case "expense":
        return "Costs incurred in generating revenue";
      default:
        return "";
    }
  };

  const getCodePrefix = (type: string) => {
    switch (type) {
      case "asset":
        return "1";
      case "liability":
        return "2";
      case "equity":
        return "3";
      case "income":
        return "4";
      case "expense":
        return "5";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/chart-of-accounts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chart of Accounts
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          </div>
          <p className="text-gray-600">
            Add a new account to your chart of accounts
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Basic details about the account
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
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested: {getCodePrefix(formData.type)}000
                      </p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      {getTypeDescription(formData.type)}
                    </p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this account is used for"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank for top-level account
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="balance"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Opening Balance
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
                  </div>

                  <div className="flex items-center">
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
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active Account
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Type Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(formData.type)}
                    {formData.type.charAt(0).toUpperCase() +
                      formData.type.slice(1)}{" "}
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {getTypeDescription(formData.type)}
                    </p>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-gray-900">
                        Normal Balance:
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.type === "asset" ||
                        formData.type === "expense"
                          ? "Debit"
                          : "Credit"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Code Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>1000-1999:</span>
                      <span className="font-medium">Assets</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2000-2999:</span>
                      <span className="font-medium">Liabilities</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3000-3999:</span>
                      <span className="font-medium">Equity</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4000-4999:</span>
                      <span className="font-medium">Income</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5000-5999:</span>
                      <span className="font-medium">Expenses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.code || !formData.name}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
                <Link href="/chart-of-accounts">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Use standard numbering conventions</p>
                    <p>• Keep descriptions clear and concise</p>
                    <p>• Group related accounts together</p>
                    <p>• Review existing accounts before creating new ones</p>
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
