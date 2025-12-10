import { useState, useRef, useEffect, useId as reactUseId } from "react";

export function SelectField({
    label,
    description,
    error,
    options = [],
    value,
    onChange,
    onSelect,
    placeholder = "Select an option",
    searchable = false,
    allowManualEntry = false,
    required = false,
    className = "",
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState(value || "");
    const selectRef = useRef(null);
    const autoId = reactUseId();
    const id = autoId;

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    const filteredOptions = (searchable || allowManualEntry)
        ? options.filter((option) => {
              const searchText = allowManualEntry ? inputValue : searchTerm;
              if (!searchText) return true;
              const optionText = String(option.label ?? option.value ?? option).toLowerCase();
              return optionText.includes(searchText.toLowerCase());
          })
        : options;

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        // Use mousedown but with a slight delay to allow button clicks to process
        const timeoutId = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const optionValue = option.value ?? option;
        
        // Close dropdown immediately
        setIsOpen(false);
        setSearchTerm("");
        setInputValue(optionValue);
        
        // Trigger onChange
        if (onChange) {
            onChange({
                target: {
                    name: "phoneNo",
                    value: optionValue,
                },
            });
        }
        
        // Trigger onSelect callback for auto-fill
        if (onSelect) {
            onSelect(option);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSearchTerm(newValue);
        
        if (onChange) {
            onChange({
                target: {
                    name: "phoneNo",
                    value: newValue,
                },
            });
        }
        
        // Open dropdown when typing if allowManualEntry
        if (!isOpen && allowManualEntry && newValue) {
            setIsOpen(true);
        }
    };

    const handleInputFocus = () => {
        if (allowManualEntry) {
            setIsOpen(true);
        }
    };

    const selectedOption = options.find(
        (opt) => (opt.value ?? opt) === value
    );
    const displayValue = selectedOption
        ? selectedOption.label ?? selectedOption.value ?? selectedOption
        : inputValue;

    return (
        <label className={`block text-left ${className}`} htmlFor={id}>
            {label && (
                <span className="text-sm font-medium text-white/90">
                    {label}
                    {required && <span className="ml-1 text-rose-300">*</span>}
                </span>
            )}
            {description && (
                <p className="mt-1 text-xs text-white/60">{description}</p>
            )}
            <div className="relative mt-2" ref={selectRef}>
                {allowManualEntry ? (
                    <div className="relative">
                        <input
                            type="text"
                            id={id}
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={`w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/50 transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 ${
                                disabled ? "opacity-50 cursor-not-allowed" : ""
                            } ${error ? "border-rose-400/50" : ""}`}
                            aria-describedby={
                                error ? `${id}-error` : description ? `${id}-description` : undefined
                            }
                            aria-invalid={Boolean(error)}
                        />
                        <button
                            type="button"
                            onClick={() => !disabled && setIsOpen(!isOpen)}
                            disabled={disabled}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                            aria-label="Toggle dropdown"
                        >
                            <svg
                                className={`h-4 w-4 transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        id={id}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={`w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-left text-sm text-white transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 ${
                            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        } ${error ? "border-rose-400/50" : ""}`}
                        aria-describedby={
                            error ? `${id}-error` : description ? `${id}-description` : undefined
                        }
                        aria-invalid={Boolean(error)}
                    >
                        <div className="flex items-center justify-between">
                            <span className={displayValue ? "text-white" : "text-white/50"}>
                                {displayValue || placeholder}
                            </span>
                            <svg
                                className={`h-4 w-4 text-white/70 transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </button>
                )}

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/20 bg-slate-900/95 backdrop-blur shadow-lg max-h-60 overflow-hidden">
                        {searchable && !allowManualEntry && (
                            <div className="p-2 border-b border-white/10">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        )}
                        {allowManualEntry && searchTerm && (
                            <div className="p-2 border-b border-white/10">
                                <div className="text-xs text-white/60">
                                    Type to search or enter manually
                                </div>
                            </div>
                        )}
                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-white/60 text-center">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => {
                                    const optionValue = option.value ?? option;
                                    const optionLabel = option.label ?? option.value ?? option;
                                    const isSelected = value === optionValue;

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSelect(option, e);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm transition ${
                                                isSelected
                                                    ? "bg-yellow-400/20 text-yellow-200"
                                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                            }`}
                                        >
                                            {optionLabel}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <p
                    id={`${id}-error`}
                    className="mt-1 text-xs font-medium text-rose-300"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </label>
    );
}

