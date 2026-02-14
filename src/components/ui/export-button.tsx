"use client";

import { useState } from "react";
import { Button } from "./button";
import {
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";

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
  className = ""
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
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
            <ChevronDown className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px]">
          <div className="space-y-1">
            <Button
              onClick={exportToCSV}
              disabled={isExporting}
              variant="ghost"
              className="w-full justify-start text-left hover:bg-gray-100"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              onClick={exportToJSON}
              disabled={isExporting}
              variant="ghost"
              className="w-full justify-start text-left hover:bg-gray-100"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
