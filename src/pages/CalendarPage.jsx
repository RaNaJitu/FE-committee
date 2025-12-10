import { useState } from "react";
import { getFestivalsForDate, getFestivalColor } from "../utils/indianFestivals.js";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState("month"); // "month" or "year"

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const goToPreviousMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        setCurrentDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        setCurrentDate(newDate);
    };

    const goToPreviousYear = () => {
        const newDate = new Date(year - 1, month, 1);
        setCurrentDate(newDate);
        if (viewMode === "year") {
            setViewMode("year");
        }
    };

    const goToNextYear = () => {
        const newDate = new Date(year + 1, month, 1);
        setCurrentDate(newDate);
        if (viewMode === "year") {
            setViewMode("year");
        }
    };

    const handleYearClick = () => {
        setViewMode("year");
    };

    const handleMonthClick = (selectedMonth) => {
        setCurrentDate(new Date(year, selectedMonth, 1));
        setViewMode("month");
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (calendarDay) => {
        if (!calendarDay.isCurrentMonth) {
            // Navigate to the month/year of the clicked day
            setCurrentDate(new Date(calendarDay.date.getFullYear(), calendarDay.date.getMonth(), 1));
        }
        // If it's the current month, do nothing (or could add event selection later)
    };

    const isToday = (calendarDay) => {
        const today = new Date();
        return (
            calendarDay.date.getDate() === today.getDate() &&
            calendarDay.date.getMonth() === today.getMonth() &&
            calendarDay.date.getFullYear() === today.getFullYear()
        );
    };

    // Generate mini calendar for a specific month
    const generateMonthCalendar = (targetYear, targetMonth) => {
        const firstDay = new Date(targetYear, targetMonth, 1).getDay();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(targetYear, targetMonth, 0).getDate();
        const today = new Date();
        const isCurrentMonth = targetYear === today.getFullYear() && targetMonth === today.getMonth();
        const todayDate = today.getDate();

        const days = [];
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const date = new Date(targetYear, targetMonth - 1, daysInPrevMonth - i);
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                isToday: false,
                date,
                festivals: getFestivalsForDate(date),
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, targetMonth, day);
            days.push({
                day,
                isCurrentMonth: true,
                isToday: isCurrentMonth && day === todayDate,
                date,
                festivals: getFestivalsForDate(date),
            });
        }

        // Next month days to fill 6 weeks
        const remaining = 42 - days.length;
        for (let day = 1; day <= remaining; day++) {
            const date = new Date(targetYear, targetMonth + 1, day);
            days.push({
                day,
                isCurrentMonth: false,
                isToday: false,
                date,
                festivals: getFestivalsForDate(date),
            });
        }

        return days;
    };

    // Generate calendar days
    const calendarDays = [];
    
    // Previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const prevMonthDate = new Date(year, month - 1, daysInPreviousMonth - i);
        const festivals = getFestivalsForDate(prevMonthDate);
        calendarDays.push({
            day: daysInPreviousMonth - i,
            isCurrentMonth: false,
            date: prevMonthDate,
            year: prevMonthDate.getFullYear(),
            month: prevMonthDate.getMonth(),
            festivals,
        });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const currentMonthDate = new Date(year, month, day);
        const festivals = getFestivalsForDate(currentMonthDate);
        calendarDays.push({
            day,
            isCurrentMonth: true,
            date: currentMonthDate,
            year: currentMonthDate.getFullYear(),
            month: currentMonthDate.getMonth(),
            festivals,
        });
    }

    // Next month's leading days
    const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
        const nextMonthDate = new Date(year, month + 1, day);
        const festivals = getFestivalsForDate(nextMonthDate);
        calendarDays.push({
            day,
            isCurrentMonth: false,
            date: nextMonthDate,
            year: nextMonthDate.getFullYear(),
            month: nextMonthDate.getMonth(),
            festivals,
        });
    }

    return (
        <div className="text-white px-4 py-6 sm:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 shadow-lg shadow-black/30">
                    {/* Calendar Header */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                                    {monthNames[month]} {year}
                                </h1>
                                <p className="text-sm text-white/60 mt-1">
                                    View and manage your schedule
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={goToPreviousMonth}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                                    aria-label="Previous month"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={goToToday}
                                    className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={goToNextMonth}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                                    aria-label="Next month"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Year Navigation */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={goToPreviousYear}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                                aria-label="Previous year"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={handleYearClick}
                                className="text-sm font-medium text-white/80 min-w-[60px] text-center px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                            >
                                {year}
                            </button>
                            <button
                                type="button"
                                onClick={goToNextYear}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                                aria-label="Next year"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {viewMode === "year" ? (
                        /* Year View - All 12 Months */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {monthNames.map((monthName, monthIndex) => {
                                const monthDays = generateMonthCalendar(year, monthIndex);
                                const isCurrentMonth = monthIndex === month;
                                const today = new Date();
                                const isCurrentYearMonth = year === today.getFullYear() && monthIndex === today.getMonth();
                                
                                return (
                                    <div
                                        key={monthIndex}
                                        className={`rounded-xl border p-3 sm:p-4 transition cursor-pointer ${
                                            isCurrentMonth
                                                ? "border-yellow-400/50 bg-yellow-400/10"
                                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                        }`}
                                        onClick={() => handleMonthClick(monthIndex)}
                                    >
                                        <h3 className="text-sm font-semibold text-white mb-2 text-center">
                                            {monthName}
                                        </h3>
                                        <div className="grid grid-cols-7 gap-0.5">
                                            {dayNames.map((day) => (
                                                <div
                                                    key={day}
                                                    className="text-[10px] text-center text-white/40 font-medium py-0.5"
                                                >
                                                    {day.slice(0, 1)}
                                                </div>
                                            ))}
                                            {monthDays.map((day, dayIndex) => {
                                                const hasFestival = day.festivals && day.festivals.length > 0;
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`text-[10px] text-center py-0.5 rounded relative ${
                                                            day.isToday && isCurrentYearMonth
                                                                ? "bg-yellow-400/30 text-yellow-300 font-semibold"
                                                                : day.isCurrentMonth
                                                                    ? "text-white/80"
                                                                    : "text-white/30"
                                                        }`}
                                                        title={hasFestival ? day.festivals.join(", ") : ""}
                                                    >
                                                        {day.day}
                                                        {hasFestival && (
                                                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-400"></span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Month View - Single Month Calendar */
                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                {/* Day Names Header */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {dayNames.map((dayName) => (
                                        <div
                                            key={dayName}
                                            className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wide"
                                        >
                                            <span className="hidden sm:inline">{dayName}</span>
                                            <span className="sm:hidden">{dayName.slice(0, 1)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((calendarDay, index) => {
                                        const isCurrentDay = isToday(calendarDay);
                                        const isCurrentMonth = calendarDay.isCurrentMonth;
                                        
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleDayClick(calendarDay)}
                                                className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border transition text-left ${
                                                    isCurrentMonth
                                                        ? isCurrentDay
                                                            ? "bg-yellow-400/20 border-yellow-400/50 text-white hover:bg-yellow-400/30"
                                                            : "border-white/10 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
                                                        : "border-white/5 bg-white/[0.02] text-white/30 hover:bg-white/5 hover:text-white/50 cursor-pointer"
                                                }`}
                                                aria-label={`${calendarDay.date.toLocaleDateString("en-US", { 
                                                    weekday: "long", 
                                                    year: "numeric", 
                                                    month: "long", 
                                                    day: "numeric" 
                                                })}`}
                                            >
                                                <div className="flex flex-col h-full">
                                                    <span
                                                        className={`text-xs sm:text-sm font-medium ${
                                                            isCurrentDay
                                                                ? "text-yellow-300"
                                                                : isCurrentMonth
                                                                    ? "text-white"
                                                                    : "text-white/30"
                                                        }`}
                                                    >
                                                        {calendarDay.day}
                                                    </span>
                                                    {/* Festivals */}
                                                    <div className="mt-auto pt-1 space-y-0.5">
                                                        {calendarDay.festivals && calendarDay.festivals.length > 0 && (
                                                            calendarDay.festivals.slice(0, 2).map((festival, festIndex) => (
                                                                <div
                                                                    key={festIndex}
                                                                    className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded border truncate ${getFestivalColor(festival)}`}
                                                                    title={festival}
                                                                >
                                                                    {festival}
                                                                </div>
                                                            ))
                                                        )}
                                                        {calendarDay.festivals && calendarDay.festivals.length > 2 && (
                                                            <div className="text-[9px] text-white/60">
                                                                +{calendarDay.festivals.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm mb-3">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-yellow-400/20 border border-yellow-400/50"></div>
                                <span className="text-white/70">Today</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-white/5 border border-white/10"></div>
                                <span className="text-white/70">Current Month</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-white/[0.02] border border-white/5"></div>
                                <span className="text-white/70">Other Month</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                <span className="text-white/70">Festival Day</span>
                            </div>
                        </div>
                        {viewMode === "month" && (
                            <p className="text-xs text-white/50">
                                Indian festivals are displayed on their respective dates. Hover over festival badges to see details.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

