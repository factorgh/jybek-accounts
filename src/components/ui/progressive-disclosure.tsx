"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  variant?: "default" | "card" | "inline";
}

export function ProgressiveDisclosure({
  children,
  title,
  description,
  defaultOpen = false,
  variant = "default",
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  const content = (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <div
        className={cn(
          "pt-4",
          variant === "card" && "px-4",
          variant === "inline" && "pt-2",
        )}
      >
        {children}
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="space-y-2">
        <button
          onClick={toggleOpen}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>{title}</span>
        </button>
        {content}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="border border-gray-200 rounded-lg">
        <Button
          variant="ghost"
          onClick={toggleOpen}
          className="w-full justify-between px-4 py-3 h-auto hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">{title}</span>
          </div>
          {description && (
            <span className="text-sm text-gray-500">{description}</span>
          )}
        </Button>
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-gray-400" />
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOpen}
          className="text-gray-500 hover:text-gray-700"
        >
          {isOpen ? "Hide" : "Show"}
        </Button>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {content}
    </div>
  );
}
