/**
 * Application route constants
 * Centralized route definitions for maintainability
 */
export const ROUTES = {
    ROOT: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    COMMITTEES: "/committees",
    PROFILE: "/profile",
    CALENDAR: "/calendar",
    DOCUMENTS: "/documents",
    OVERVIEW: "/overview",
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
    overview: ROUTES.COMMITTEES,
    documents: ROUTES.DOCUMENTS,
};

