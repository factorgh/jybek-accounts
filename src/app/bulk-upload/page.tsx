"use client";

import * as React from "react";
import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Save,
  Eye,
} from "lucide-react";

interface BulkUploadItem {
  row: number;
  transactionDate: string;
  description: string;
  reference: string;
  accountCode: string;
  debitAmount: number;
  creditAmount: number;
  status: "pending" | "valid" | "error";
  errors?: string[];
}

export default function BulkUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<
    "transactions" | "customers" | "accounts"
  >("transactions");
  const [csvData, setCsvData] = useState<BulkUploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim());

    const items: BulkUploadItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length >= headers.length) {
        const item: BulkUploadItem = {
          row: i,
          transactionDate: values[0] || "",
          description: values[1] || "",
          reference: values[2] || "",
          accountCode: values[3] || "",
          debitAmount: parseFloat(values[4]) || 0,
          creditAmount: parseFloat(values[5]) || 0,
          status: "pending",
        };

        // Validate item
        const errors = validateBulkItem(item);
        item.status = errors.length > 0 ? "error" : "valid";
        item.errors = errors;

        items.push(item);
      }
    }

    setCsvData(items);
  };

  const validateBulkItem = (item: BulkUploadItem): string[] => {
    const errors: string[] = [];

    if (!item.transactionDate) errors.push("Transaction date is required");
    if (!item.description) errors.push("Description is required");
    if (!item.accountCode) errors.push("Account code is required");
    if (item.debitAmount <= 0 && item.creditAmount <= 0) {
      errors.push("Either debit or credit amount must be greater than 0");
    }
    if (item.debitAmount > 0 && item.creditAmount > 0) {
      errors.push("Cannot have both debit and credit amounts");
    }

    return errors;
  };

  const downloadTemplate = () => {
    let template = "";

    if (uploadType === "transactions") {
      template =
        "Transaction Date,Description,Reference,Account Code,Debit Amount,Credit Amount\n";
      template += "2024-01-15,Office Rent Payment,RENT001,5200,,1000\n";
      template += "2024-01-20,Client Payment,PAY001,1000,5000,\n";
      template += "2024-01-25,Software Subscription,SUB001,5300,,99\n";
    } else if (uploadType === "customers") {
      template = "Name,Email,Phone,Address,Credit Limit,Payment Terms\n";
      template +=
        'ABC Corporation,billing@abccorp.com,+1-555-0101,"123 Business Ave, Suite 100",5000,Net 30\n';
      template +=
        'XYZ Industries,accounts@xyzindustries.com,+1-555-0102,"456 Industrial Blvd",2500,Net 15\n';
    } else if (uploadType === "accounts") {
      template = "Code,Name,Type,Description,Parent Code,Opening Balance\n";
      template +=
        '1000,Cash and Cash Equivalents,Asset,"Petty cash, checking accounts",,25000\n';
      template +=
        '1100,Accounts Receivable,Asset,"Money owed by customers",,15000\n';
    }

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${uploadType}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processBulkData = async () => {
    setIsProcessing(true);

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update status for valid items
      const processedData = csvData.map((item) => {
        if (item.status === "valid") {
          return { ...item, status: "valid" as const };
        }
        return item;
      });

      setCsvData(processedData);
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadBulkData = async () => {
    setIsUploading(true);

    try {
      const validItems = csvData.filter((item) => item.status === "valid");

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(`Successfully uploaded ${validItems.length} items!`);
      router.push("/transactions");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload data");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const validCount = csvData.filter((item) => item.status === "valid").length;
  const errorCount = csvData.filter((item) => item.status === "error").length;
  const pendingCount = csvData.filter(
    (item) => item.status === "pending",
  ).length;

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
            <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
          </div>
          <p className="text-gray-600">
            Upload multiple transactions, customers, or accounts at once using
            CSV files
          </p>
        </div>

        <Tabs
          value={uploadType}
          onValueChange={(value) => setUploadType(value as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value={uploadType} className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to bulk import {uploadType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose CSV File
                    </Button>
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>

                  {csvData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-800 font-medium">
                                Valid
                              </p>
                              <p className="text-2xl font-bold text-green-900">
                                {validCount}
                              </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-800 font-medium">Errors</p>
                              <p className="text-2xl font-bold text-red-900">
                                {errorCount}
                              </p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-800 font-medium">
                                Pending
                              </p>
                              <p className="text-2xl font-bold text-yellow-900">
                                {pendingCount}
                              </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Data Preview */}
            {csvData.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Data Preview</CardTitle>
                      <CardDescription>
                        Review and validate your data before uploading
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {pendingCount > 0 && (
                        <Button
                          onClick={processBulkData}
                          disabled={isProcessing}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {isProcessing ? "Processing..." : "Validate Data"}
                        </Button>
                      )}
                      {validCount > 0 && (
                        <Button
                          onClick={uploadBulkData}
                          disabled={isUploading || validCount === 0}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isUploading
                            ? "Uploading..."
                            : `Upload ${validCount} Items`}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Row
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
                            Account
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Debit
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Credit
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((item) => (
                          <tr
                            key={item.row}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900">
                                  {item.row}
                                </span>
                                {getStatusIcon(item.status)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {item.transactionDate}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {item.description}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {item.reference}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {item.accountCode}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {item.debitAmount > 0
                                ? `$${item.debitAmount.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {item.creditAmount > 0
                                ? `$${item.creditAmount.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(item.status)}
                              {item.errors && item.errors.length > 0 && (
                                <div className="mt-1">
                                  {item.errors.map((error, index) => (
                                    <p
                                      key={index}
                                      className="text-xs text-red-600"
                                    >
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      How to use bulk upload:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      <li>Download the CSV template for your data type</li>
                      <li>Fill in your data following the template format</li>
                      <li>Upload your completed CSV file</li>
                      <li>Review validation results and fix any errors</li>
                      <li>Click upload to import valid data</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Important notes:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>
                        Ensure account codes exist in your chart of accounts
                      </li>
                      <li>Transaction dates must be in YYYY-MM-DD format</li>
                      <li>
                        Each row must have either a debit or credit amount, not
                        both
                      </li>
                      <li>Required fields must not be empty</li>
                      <li>Review validation errors before uploading</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
