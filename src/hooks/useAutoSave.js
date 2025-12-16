import { useEffect, useRef } from "react";
import { useDebounce } from "./useDebounce.js";

/**
 * Custom hook for auto-saving with debounce
 * @param {*} value - Value to auto-save
 * @param {Function} onSave - Callback function to execute on save
 * @param {number} delay - Debounce delay in milliseconds (default: 2000)
 */
export function useAutoSave(value, onSave, delay = 2000) {
    const debouncedValue = useDebounce(value, delay);
    const isFirstRender = useRef(true);
    const previousValue = useRef(value);

    useEffect(() => {
        // Skip on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            previousValue.current = value;
            return;
        }

        // Only save if value has actually changed
        if (debouncedValue !== previousValue.current && debouncedValue !== undefined && debouncedValue !== null && debouncedValue !== "") {
            onSave(debouncedValue);
            previousValue.current = debouncedValue;
        }
    }, [debouncedValue, onSave]);
}

