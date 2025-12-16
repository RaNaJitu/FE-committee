/**
 * Format date to display format (e.g., "25 NOV 2025")
 * @param {string|Date} value - Date value to format
 * @returns {string} Formatted date string
 */
export function formatDrawDate(value) {
    if (!value) return "—";
    
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}

/**
 * Format time to display format (e.g., "7PM")
 * @param {string|Date} value - Time value to format
 * @returns {string} Formatted time string
 */
export function formatDrawTime(value) {
    if (!value) return "—";

    const normalize = () => {
        const timePattern = /^(\d{1,2}):?(\d{2})?:?(\d{2})?$/;
        const match = timePattern.exec(value);
        if (!match) return null;
        const [, rawHour, rawMinute, rawSecond] = match;
        return {
            hour: Number.parseInt(rawHour, 10),
            minute: Number.parseInt(rawMinute ?? rawSecond ?? "0", 10),
        };
    };

    let hourMinute = normalize();

    if (!hourMinute) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            hourMinute = { hour: date.getHours(), minute: date.getMinutes() };
        }
    }

    if (!hourMinute) {
        return value;
    }

    let { hour, minute } = hourMinute;
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const minuteStr = minute ? `:${minute.toString().padStart(2, "0")}` : "";

    return `${hour}${minuteStr}${period}`;
}

/**
 * Format date to ISO string with time set to noon
 * @param {string|Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
export function formatDateToISO(date) {
    if (!date) return "";
    
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    
    // Set time to noon
    d.setHours(12, 0, 0, 0);
    
    return d.toISOString();
}

