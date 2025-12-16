/**
 * Application-wide constants
 */

/**
 * User roles
 */
export const USER_ROLES = {
    ADMIN: "ADMIN",
    USER: "USER",
    SUPER_ADMIN: "SUPERADMIN",
};

/**
 * Committee status values
 */
export const COMMITTEE_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    COMPLETED: "COMPLETED",
    COMPLETE: "COMPLETE",
};

/**
 * Draw timer default duration (in seconds)
 */
export const DEFAULT_DRAW_TIMER_SECONDS = 300; // 5 minutes

/**
 * Debounce delay for auto-save (in milliseconds)
 */
export const AUTO_SAVE_DEBOUNCE_MS = 2000; // 2 seconds

/**
 * Validation rules
 */
export const VALIDATION = {
    PASSWORD: {
        MIN_LENGTH: 6,
    },
    PHONE: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 15,
    },
};

/**
 * Date/time formats
 */
export const DATE_FORMATS = {
    DISPLAY_DATE: "DD MMM YYYY", // e.g., "25 NOV 2025"
    DISPLAY_TIME: "hA", // e.g., "7PM"
    ISO: "YYYY-MM-DDTHH:mm:ss.sssZ",
};

