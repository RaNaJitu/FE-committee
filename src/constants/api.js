/**
 * API endpoint constants
 * Centralized API path definitions
 */
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "api/v1/auth/login",
        REGISTER: "api/v1/auth/register",
        PROFILE: "api/v1/auth/profile/me",
        LOGOUT: "api/v1/auth/logout",
        CHANGE_PASSWORD: "api/v1/auth/change-password",
        FORGOT_PASSWORD: "api/v1/auth/forgot-password",
        USER_LIST: "api/v1/auth/user-list",
    },
    COMMITTEE: {
        LIST: "api/v1/committee/get",
        CREATE: "api/v1/committee/add",
        MEMBER: {
            GET: "api/v1/committee/member/get",
            ADD: "api/v1/committee/member/add",
        },
        DRAW: {
            GET: "api/v1/draw/get",
            AMOUNT_UPDATE: "api/v1/draw/amount-update",
            USER_WISE_PAID: "api/v1/draw/user-wise-paid",
            USER_WISE_COMPLETED: "api/v1/draw/user-wise-completed",
        },
    },
};

/**
 * API request timeout (in milliseconds)
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

