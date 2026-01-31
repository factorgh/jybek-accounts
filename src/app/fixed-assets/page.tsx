"use client";

import * as React from "react";
import { FixedAssetsDashboard } from "@/components/fixed-assets/FixedAssetsDashboard";

export default function FixedAssetsPage() {
  // In a real app, this would come from authentication context
  const businessId = "demo-business";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <FixedAssetsDashboard businessId={businessId} />
      </div>
    </div>
  );
}
