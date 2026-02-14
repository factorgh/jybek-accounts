"use client";

import { useState } from "react";
import { Button } from "./button";
import { Download } from "lucide-react";

interface ExportData {
  [key: string]: string | number | boolean;
}

interface ExportButtonProps {
  data: ExportData[];
  filename: string;
  title?: string;
  className?: string;
}

export default function ExportButton({
  data,
  filename,
  title = "Export Data",
  className = "",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      // Create comprehensive Excel-style CSV format with all data
      const headers = Object.keys(data[0]);
      const csvContent = [
        // Header row with metadata
        `Chart of Accounts Export - Generated: ${new Date().toLocaleDateString()}`,
        "",
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              return typeof value === "string" && value.includes(",")
                ? `"${value.replace(/"/g, '""')}"` // escape double quotes
                : value;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}-comprehensive-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={exportToExcel}
        disabled={isExporting || data.length === 0}
        className={`bg-white/80 hover:bg-white ${className}`}
        variant="outline"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            {title}
          </>
        )}
      </Button>
    </div>
  );
}
