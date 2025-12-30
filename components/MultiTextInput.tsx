// components/MultiTextInput.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface MultiTextInputProps {
  label: string | React.ReactNode;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
  inputClassName?: string;
  description?: string;
  required?: boolean;
  tagColor?: "red" | "blue" | "green" | "amber" | "primary";
  animationDelay?: number;
  autoFocus?: boolean;
}

export function MultiTextInput({
  label,
  placeholder = "Enter value",
  values,
  onChange,
  className = "",
  inputClassName = "",
  description,
  required = false,
  tagColor = "primary",
  animationDelay = 50,
  autoFocus = false,
}: MultiTextInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      const newValues = [...values, inputValue.trim()];
      onChange(newValues);
      setInputValue("");
    }
  };

  const removeValue = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const colorClasses = {
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    primary: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className={className}>
      <Label className="text-xs sm:text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}

      {/* Current values display */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {values.map((value, index) => (
            <div
              key={index}
              className={`animate-fadeInUp flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${colorClasses[tagColor]}`}
              style={{ animationDelay: `${index * animationDelay}ms` }}
            >
              <span className="max-w-[200px] truncate">{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeValue(index)}
                className="h-5 w-5 p-0 ml-1 hover:bg-transparent hover:opacity-70"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input and add button */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className={`flex-1 ${inputClassName}`}
          autoFocus={autoFocus}
        />
        <Button
          type="button"
          onClick={addValue}
          disabled={!inputValue.trim()}
          variant="outline"
          className="flex items-center gap-1 whitespace-nowrap min-w-[80px] justify-center"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
    </div>
  );
}
