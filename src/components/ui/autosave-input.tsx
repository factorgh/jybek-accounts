"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Save, Check, AlertCircle, Loader2 } from "lucide-react";

interface AutosaveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSave?: (value: string) => Promise<void>;
  debounceMs?: number;
}

export function AutosaveInput({
  onSave,
  debounceMs = 1000,
  className,
  value: controlledValue,
  onChange,
  ...props
}: AutosaveInputProps) {
  const [value, setValue] = React.useState(controlledValue || "");
  const [status, setStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  const debounceRef = React.useRef<NodeJS.Timeout>();
  const prevValueRef = React.useRef(controlledValue);

  React.useEffect(() => {
    if (controlledValue !== prevValueRef.current) {
      setValue(controlledValue || "");
      prevValueRef.current = controlledValue;
    }
  }, [controlledValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setError(null);

    if (onChange) {
      onChange(e);
    }

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for autosave
    if (onSave && newValue !== controlledValue) {
      setStatus("saving");

      debounceRef.current = setTimeout(async () => {
        try {
          await onSave(newValue);
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Save failed");
          setTimeout(() => setStatus("idle"), 3000);
        }
      }, debounceMs);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "saved":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <input
        {...props}
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          status === "saving" && "pr-10",
          status === "saved" && "pr-10 border-green-300",
          status === "error" && "pr-10 border-red-300",
          className,
        )}
      />

      {status !== "idle" && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {getStatusIcon()}
        </div>
      )}

      {error && (
        <div className="absolute left-0 -bottom-6 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
