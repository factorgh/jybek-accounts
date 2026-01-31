"use client";

import * as React from "react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";

export default function InventoryPage() {
  // In a real app, this would come from authentication context
  const businessId = "demo-business";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <InventoryDashboard businessId={businessId} />
      </div>
    </div>
  );
}
