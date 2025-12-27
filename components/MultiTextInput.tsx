// components/MultiTextInput.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface MultiTextInputProps {
  label: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
  description?: string;
  required?: boolean;
}

export function MultiTextInput({
  label,
  placeholder = "Enter value",
  values,
  onChange,
  className = "",
  description,
  required = false,
}: MultiTextInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">
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
              className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              <span>{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeValue(index)}
                className="h-auto p-0 w-5 hover:bg-transparent"
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
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addValue}
          disabled={!inputValue.trim()}
          variant="outline"
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
