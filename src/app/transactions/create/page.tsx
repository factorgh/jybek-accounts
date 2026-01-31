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
import { ArrowLeft, DollarSign, Save } from "lucide-react";

export default function CreateTransactionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    type: "journal",
    lines: [
      { accountCode: "", debitAmount: 0, creditAmount: 0, description: "" },
      { accountCode: "", debitAmount: 0, creditAmount: 0, description: "" },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLineChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      lines: newLines,
    }));
  };

  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { accountCode: "", debitAmount: 0, creditAmount: 0, description: "" },
      ],
    }));
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 2) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        lines: newLines,
      }));
    }
  };

  const calculateTotals = () => {
    const totalDebits = formData.lines.reduce(
      (sum, line) => sum + Number(line.debitAmount),
      0,
    );
    const totalCredits = formData.lines.reduce(
      (sum, line) => sum + Number(line.creditAmount),
      0,
    );
    return { totalDebits, totalCredits };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { totalDebits, totalCredits } = calculateTotals();

      if (totalDebits !== totalCredits) {
        alert(
          "Transaction must balance. Total debits must equal total credits.",
        );
        return;
      }

      // Mock transaction creation - in production, this would call your API
      alert("Transaction created successfully!");
      router.push("/transactions");
    } catch (error) {
      console.error("Transaction creation error:", error);
      alert("Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const { totalDebits, totalCredits } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Create Transaction
            </h1>
          </div>
          <p className="text-gray-600">
            Record a new journal entry with proper double-entry accounting
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>
                    Basic information about this transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="transactionDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        id="transactionDate"
                        name="transactionDate"
                        value={formData.transactionDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Transaction Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="journal">Journal Entry</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="invoice">Invoice</option>
                        <option value="payment">Payment</option>
                      </select>
                    </div>
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
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter transaction description"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reference"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reference (Optional)
                    </label>
                    <input
                      type="text"
                      id="reference"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Invoice number, check number, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Lines */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transaction Lines</CardTitle>
                      <CardDescription>
                        Enter the debit and credit entries for this transaction
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      onClick={addLine}
                      variant="outline"
                      size="sm"
                    >
                      Add Line
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.lines.map((line, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Account Code (e.g., 1000)"
                            value={line.accountCode}
                            onChange={(e) =>
                              handleLineChange(
                                index,
                                "accountCode",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Debit"
                            value={line.debitAmount || ""}
                            onChange={(e) =>
                              handleLineChange(
                                index,
                                "debitAmount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Credit"
                            value={line.creditAmount || ""}
                            onChange={(e) =>
                              handleLineChange(
                                index,
                                "creditAmount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Description"
                            value={line.description}
                            onChange={(e) =>
                              handleLineChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {formData.lines.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeLine(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Balance Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Balance Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Debits:</span>
                      <span className="font-medium">
                        ${totalDebits.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Credits:</span>
                      <span className="font-medium">
                        ${totalCredits.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Difference:</span>
                        <span
                          className={`font-medium ${totalDebits === totalCredits ? "text-green-600" : "text-red-600"}`}
                        >
                          ${Math.abs(totalDebits - totalCredits).toFixed(2)}
                        </span>
                      </div>
                      {totalDebits === totalCredits ? (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Transaction is balanced
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 mt-2">
                          ✗ Transaction must balance
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Account Reference */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Account Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">1000:</span>
                      <span>Cash & Cash Equivalents</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">1100:</span>
                      <span>Accounts Receivable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2000:</span>
                      <span>Accounts Payable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3000:</span>
                      <span>Owner's Equity</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">4000:</span>
                      <span>Sales Revenue</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">5000:</span>
                      <span>Expenses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading || totalDebits !== totalCredits}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Transaction"}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
