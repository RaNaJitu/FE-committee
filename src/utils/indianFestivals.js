/**
 * Indian Festivals Data
 * Includes major festivals with their dates
 * Note: Some festivals like Diwali vary by year based on lunar calendar
 * For simplicity, using approximate dates - can be enhanced with lunar calendar calculations
 */

// Fixed date festivals (same date every year)
// Note: Some festivals like Raksha Bandhan and Dussehra vary by year, but using approximate fixed dates
const fixedFestivals = {
    "01-14": "Makar Sankranti",
    "01-26": "Republic Day",
    "03-08": "Holi",
    "04-14": "Baisakhi",
    "08-15": "Independence Day",
    "08-30": "Raksha Bandhan", // Approximate - varies by year
    "09-17": "Ganesh Chaturthi",
    "10-02": "Gandhi Jayanti",
    "10-15": "Dussehra", // Approximate - varies by year
    "11-14": "Children's Day",
    "12-25": "Christmas",
};

// Year-based festivals (dates vary by year)
const getYearBasedFestivals = (year) => {
    // Diwali dates (approximate - actual dates vary based on lunar calendar)
    const diwaliDates = {
        2024: "2024-11-01",
        2025: "2025-10-21",
        2026: "2026-11-08",
        2027: "2027-10-29",
        2028: "2028-10-17",
        2029: "2029-11-05",
        2030: "2030-10-26",
    };

    // Eid dates (approximate)
    const eidDates = {
        2024: "2024-04-11",
        2025: "2025-03-31",
        2026: "2026-03-20",
        2027: "2027-03-10",
        2028: "2028-02-27",
        2029: "2029-02-15",
        2030: "2030-02-05",
    };

    // Christmas (fixed but included here for consistency)
    const festivals = {};

    // Diwali
    if (diwaliDates[year]) {
        const date = new Date(diwaliDates[year]);
        const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        festivals[key] = "Diwali";
    }

    // Eid
    if (eidDates[year]) {
        const date = new Date(eidDates[year]);
        const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        festivals[key] = "Eid";
    }

    return festivals;
};

/**
 * Get festivals for a specific date
 * @param {Date} date - The date to get festivals for
 * @returns {Array} Array of festival names
 */
export function getFestivalsForDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const key = `${month}-${day}`;
    const year = date.getFullYear();

    const festivals = [];

    // Check fixed festivals
    if (fixedFestivals[key]) {
        festivals.push(fixedFestivals[key]);
    }

    // Check year-based festivals
    const yearFestivals = getYearBasedFestivals(year);
    if (yearFestivals[key]) {
        festivals.push(yearFestivals[key]);
    }

    return festivals;
}

/**
 * Get all festivals for a given year
 * @param {number} year - The year
 * @returns {Object} Object with date keys and festival arrays
 */
export function getFestivalsForYear(year) {
    const festivals = {};
    const yearFestivals = getYearBasedFestivals(year);

    // Add fixed festivals
    Object.keys(fixedFestivals).forEach((key) => {
        const [month, day] = key.split("-");
        const date = new Date(year, parseInt(month) - 1, parseInt(day));
        const dateKey = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        
        if (!festivals[dateKey]) {
            festivals[dateKey] = [];
        }
        festivals[dateKey].push(fixedFestivals[key]);
    });

    // Add year-based festivals
    Object.keys(yearFestivals).forEach((key) => {
        if (!festivals[key]) {
            festivals[key] = [];
        }
        festivals[key].push(yearFestivals[key]);
    });

    return festivals;
}

/**
 * Get festival color based on festival name
 * @param {string} festivalName - Name of the festival
 * @returns {string} Color class
 */
export function getFestivalColor(festivalName) {
    const colors = {
        "Diwali": "bg-yellow-400/30 text-yellow-200 border-yellow-400/50",
        "Holi": "bg-pink-400/30 text-pink-200 border-pink-400/50",
        "Eid": "bg-green-400/30 text-green-200 border-green-400/50",
        "Republic Day": "bg-orange-400/30 text-orange-200 border-orange-400/50",
        "Independence Day": "bg-blue-400/30 text-blue-200 border-blue-400/50",
        "Gandhi Jayanti": "bg-emerald-400/30 text-emerald-200 border-emerald-400/50",
    };
    
    return colors[festivalName] || "bg-purple-400/30 text-purple-200 border-purple-400/50";
}

