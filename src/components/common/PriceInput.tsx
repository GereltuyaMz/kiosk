import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type PriceInputProps = {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  allowNegative?: boolean;
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
  allowNegative = false,
}: PriceInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    setDisplayValue(formatPriceForInput(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");

    const regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;

    if (rawValue === "" || rawValue === "-" || regex.test(rawValue)) {
      setDisplayValue(rawValue ? (rawValue === "-" ? "-" : parseFloat(rawValue).toLocaleString("en-US")) : "");
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
