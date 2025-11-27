import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type PriceInputProps = {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
};

const formatPriceForInput = (value: number): string => {
  if (!value && value !== 0) return "";
  return value.toLocaleString("en-US");
};

export const PriceInput = ({
  value,
  onChange,
  id,
  placeholder = "0",
  disabled,
}: PriceInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    setDisplayValue(formatPriceForInput(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");

    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      setDisplayValue(rawValue ? parseFloat(rawValue).toLocaleString("en-US") : "");
      onChange(parseFloat(rawValue) || 0);
    }
  };

  return (
    <Input
      id={id}
      type="text"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
    />
  );
};
