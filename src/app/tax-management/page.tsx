"use client";

import * as React from "react";
import { TaxManagementDashboard } from "@/components/tax/TaxManagementDashboard";

export default function TaxManagementPage() {
  // In a real app, this would come from authentication context
  const businessId = "demo-business";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TaxManagementDashboard businessId={businessId} />
      </div>
    </div>
  );
}
