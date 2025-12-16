import { API_ENDPOINTS, API_TIMEOUT } from "../constants/api.js";

// Get API base URL from environment variable
// In production, this MUST be set - fail fast if missing
const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (import.meta.env.PROD && !envUrl) {
        throw new Error(
            "VITE_API_BASE_URL environment variable is required in production. " +
            "Please set it in your production environment."
        );
    }
    
    // Development fallback (only in dev mode)
    return envUrl ?? "http://10.255.253.32:4000";
};

const DEFAULT_BASE_URL = getApiBaseUrl();
const DEFAULT_TIMEOUT = API_TIMEOUT;

// Re-export for convenience
const API = API_ENDPOINTS;

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
    onUnauthorizedCallback = callback;
}

function getBaseUrl() {
    return DEFAULT_BASE_URL.replace(/\/+$/, "");
}

async function request(path, options = {}) {
    const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;
    const abortController = options.signal ? null : new AbortController();
    const signal = options.signal ?? abortController.signal;

    // Set up timeout
    const timeoutId = setTimeout(() => {
        if (abortController) {
            abortController.abort();
        }
    }, timeout);

    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        ...(options.body ? { body: options.body } : {}),
        signal,
    };
    
    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        const contentType = response.headers.get("content-type");
        const isJson = contentType?.includes("application/json");
        const payload = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            // Handle token expiration (401 Unauthorized or 403 Forbidden)
            if ((response.status === 401 || response.status === 403) && onUnauthorizedCallback) {
                onUnauthorizedCallback();
            }
            
            const message =
                (isJson && (payload.message || payload.error)) ||
                (typeof payload === "string" && payload) ||
                "Unexpected error";
            const error = new Error(message);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
            const timeoutError = new Error(`Request timeout after ${timeout}ms`);
            timeoutError.name = "TimeoutError";
            throw timeoutError;
        }
        throw error;
    }
}

export async function login({ phoneNo, password }) {
    const result = await request(API.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify({ phoneNo, password }),
    });

    const accessToken =
        result.data.accessToken || result.data.access_token || result.data.token || result.data.jwt;

    if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned.");
    }

    return {
        token: accessToken,
        raw: result,
    };
}

export async function getProfile(token) {
    return request(API_ENDPOINTS.AUTH.PROFILE, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getCommittees(token) {
    return request(API_ENDPOINTS.COMMITTEE.LIST, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function createCommittee(token, data) {
    // Remove undefined values to ensure clean JSON
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    );
    
    const bodyString = JSON.stringify(cleanData);
    
    return request(API.COMMITTEE.CREATE, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: bodyString,
    });
}

export async function logout(token) {
    return request(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
    });
}

export async function addCommitteeMember(token, data) {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== ""),
    );

    return request(API.COMMITTEE.MEMBER.ADD, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
    });
}

export async function registerUser(data) {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== ""),
    );

    return request(API.AUTH.REGISTER, {
        method: "POST",
        body: JSON.stringify(cleanData),
    });
}

export async function getCommitteeMembers(token, committeeId) {
    return request(`${API.COMMITTEE.MEMBER.GET}?committeeId=${committeeId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getPaidAmountDrawWise(token, committeeId, drawId = null, options = {}) {
    let url = `${API.COMMITTEE.DRAW.USER_WISE_PAID}?committeeId=${committeeId}`;
    if (drawId) {
        url += `&drawId=${drawId}`;
    }
    return request(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        ...options,
    });
}

export async function getUserList(token) {
    return request(API.AUTH.USER_LIST, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getCommitteeDraws(token, committeeId) {
    return request(`${API.COMMITTEE.DRAW.GET}?committeeId=${committeeId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function markUserDrawPaid(token, data) {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== ""),
    );

    return request(API.COMMITTEE.DRAW.USER_WISE_PAID, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
    });
}

export async function changePassword(token, data) {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== ""),
    );

    return request(API.AUTH.CHANGE_PASSWORD, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
    });
}

export async function forgotPassword(data) {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== ""),
    );

    return request(API.AUTH.FORGOT_PASSWORD, {
        method: "PATCH",
        body: JSON.stringify(cleanData),
    });
}

export async function updateDrawAmount(token, data) {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== ""),
    );

    return request(API.COMMITTEE.DRAW.AMOUNT_UPDATE, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
    });
}