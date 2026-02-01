"use client";

import { useState } from "react";
import apiClient from "@/lib/api/client";

export default function TestAPIPage() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testGetAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAccounts();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateAccount = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.createAccount({
        code: "9999",
        name: "Test Account",
        type: "asset",
        openingBalance: 1000,
        isActive: true,
        description: "Test account creation"
      });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testGetAccounts}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Test GET Accounts"}
          </button>
          
          <button
            onClick={testCreateAccount}
            disabled={isLoading}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Test CREATE Account"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result || "No result yet. Click a test button above."}
          </pre>
        </div>
      </div>
    </div>
  );
}
