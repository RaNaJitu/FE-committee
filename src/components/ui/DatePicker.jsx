import { useEffect, useRef, useState } from "react";
import { useId } from "react";

export function DatePicker({
    label,
    description,
    error,
    value,
    onChange,
    minDate,
    maxDate,
    required,
    className = "",
    placeholder = "Select a date",
    name,
}) {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Parse value to Date object with validation
    // Handles both ISO format (2026-01-01T12:39:43.495Z) and YYYY-MM-DD format
    const parseDate = (dateString) => {
        if (!dateString) return null;
        
        // Try parsing as ISO date first
        let date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            // Validate date components if it's YYYY-MM-DD format
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = dateString.split('-').map(Number);
                const dateCheck = new Date(year, month - 1, day);
                if (
                    dateCheck.getFullYear() !== year ||
                    dateCheck.getMonth() !== month - 1 ||
                    dateCheck.getDate() !== day
                ) {
                    return null;
                }
            }
            return date;
        }
        
        return null;
    };

    const selectedDate = parseDate(value);
    const minDateObj = parseDate(minDate);
    const maxDateObj = parseDate(maxDate);

    // Initialize current month to selected date or today
    useEffect(() => {
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        } else {
            const today = new Date();
            setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        }
    }, [selectedDate]);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        
        // Handle both ISO format and YYYY-MM-DD format
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "";
        
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateForInput = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const isDisabled = (date) => {
        if (minDateObj && date < minDateObj) {
            const min = new Date(minDateObj);
            min.setHours(0, 0, 0, 0);
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d < min;
        }
        if (maxDateObj && date > maxDateObj) {
            const max = new Date(maxDateObj);
            max.setHours(23, 59, 59, 999);
            const d = new Date(date);
            d.setHours(23, 59, 59, 999);
            return d > max;
        }
        return false;
    };

    const handleDateSelect = (date) => {
        if (isDisabled(date)) return;
        
        // Format date as ISO string (2026-01-01T12:39:43.495Z)
        // Set time to noon to avoid timezone issues
        const isoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
        const formattedDate = isoDate.toISOString();
        
        const syntheticEvent = {
            target: {
                name: name,
                value: formattedDate,
            },
        };
        onChange(syntheticEvent);
        setIsOpen(false);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        if (!isDisabled(today)) {
            handleDateSelect(today);
        }
    };

    const generateCalendarDays = () => {
        const days = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = getFirstDayOfMonth(currentMonth);
        const daysInMonth = getDaysInMonth(currentMonth);
        const daysInPrevMonth = getDaysInMonth(new Date(year, month - 1, 1));

        // Previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, daysInPrevMonth - i);
            days.push({
                date,
                isCurrentMonth: false,
            });
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({
                date,
                isCurrentMonth: true,
            });
        }

        // Next month's leading days to fill 6 weeks
        const remaining = 42 - days.length;
        for (let day = 1; day <= remaining; day++) {
            const date = new Date(year, month + 1, day);
            days.push({
                date,
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className={`block text-left ${className}`} ref={containerRef}>
            {label && (
                <span className="text-sm font-medium text-white/90">
                    {label}
                    {required && <span className="ml-1 text-rose-300">*</span>}
                </span>
            )}
            {description && (
                <p className="mt-1 text-xs text-white/60">{description}</p>
            )}
            <div className="relative mt-2">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        id={id}
                        name={name}
                        value={selectedDate ? formatDate(selectedDate) : ""}
                        readOnly
                        placeholder={placeholder}
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full rounded-lg border ${
                            error ? "border-rose-400/50" : "border-white/20"
                        } bg-white/10 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/50 transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer`}
                        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
                        aria-invalid={Boolean(error)}
                        required={required}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-white/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Hidden input for form submission */}
                <input
                    type="hidden"
                    name={name}
                    value={value || ""}
                />

                {/* Calendar Popup */}
                {isOpen && (
                    <div className="absolute z-[100] mt-2 w-full min-w-[320px] max-w-[400px] rounded-lg border border-white/20 bg-slate-900 shadow-xl shadow-black/50 p-4 sm:right-0 sm:w-auto">
                        {/* Calendar Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={goToPreviousMonth}
                                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                aria-label="Previous month"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={goToNextMonth}
                                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                aria-label="Next month"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Names */}
                        <div className="mb-2 grid grid-cols-7 gap-1">
                            {dayNames.map((day) => (
                                <div
                                    key={day}
                                    className="py-2 text-center text-xs font-semibold text-white/60"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((dayData, index) => {
                                const { date, isCurrentMonth } = dayData;
                                const dayIsToday = isToday(date);
                                const dayIsSelected = isSelected(date);
                                const dayIsDisabled = isDisabled(date);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDateSelect(date)}
                                        disabled={dayIsDisabled}
                                        className={`rounded-lg p-2 text-sm transition ${
                                            dayIsDisabled
                                                ? "cursor-not-allowed text-white/20"
                                                : dayIsSelected
                                                    ? "bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-400/90"
                                                    : dayIsToday
                                                        ? "bg-white/10 text-white font-semibold hover:bg-white/20"
                                                        : isCurrentMonth
                                                            ? "text-white hover:bg-white/10"
                                                            : "text-white/30 hover:bg-white/5"
                                        }`}
                                        aria-label={date.toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Today Button */}
                        <div className="mt-4 flex justify-center border-t border-white/10 pt-4">
                            <button
                                type="button"
                                onClick={goToToday}
                                disabled={isDisabled(new Date())}
                                className="rounded-lg px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Today
                            </button>
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
        </div>
    );
}

