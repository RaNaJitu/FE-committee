/**
 * Application route constants
 * Centralized route definitions for maintainability
 */
export const ROUTES = {
    ROOT: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
    CALENDAR: "/dashboard/calendar",
    COMMITTEE_DETAILS: (id) => `/dashboard/committee/${id}`,
};

/**
 * Navigation route mapping
 * Maps navigation IDs to their corresponding routes
 */
export const NAVIGATION_ROUTES = {
    committees: ROUTES.DASHBOARD,
    calendar: ROUTES.CALENDAR,
    profile: ROUTES.PROFILE,
    overview: ROUTES.DASHBOARD,
    documents: ROUTES.DASHBOARD,
};

