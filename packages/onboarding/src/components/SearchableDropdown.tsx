import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = any;

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  valueField: string;
  titleFieldFn: (_: Option,forShowingVal?:boolean) => string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  valueField,
  titleFieldFn,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = options.filter((option) =>
    titleFieldFn(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option[valueField] === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option[valueField]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 text-left border rounded-md flex items-center justify-between",
          "bg-[#252525] border-[#252525] text-white font-roboto",
          "focus:outline-none focus:border-[#D22A38] focus:ring-1 focus:ring-[#D22A38]",
          "transition-colors duration-200",
          disabled && "opacity-50 cursor-not-allowed",
          !selectedOption && "text-[#92929D]"
        )}
      >
        <span className="truncate">
          {selectedOption ? titleFieldFn(selectedOption, true) : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#92929D] transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#252525] rounded-md shadow-lg">
          <div className="p-2 border-b border-[#252525]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#92929D]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#252525] border border-[#252525] rounded text-white placeholder-[#92929D] focus:outline-none focus:border-[#D22A38] font-roboto"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-[#252525] text-white font-roboto transition-colors duration-150"
                >
                  {titleFieldFn(option)}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[#92929D] font-roboto">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
