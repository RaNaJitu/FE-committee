const DEFAULT_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://10.255.253.32:4000";

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
    onUnauthorizedCallback = callback;
}

function getBaseUrl() {
    return DEFAULT_BASE_URL.replace(/\/+$/, "");
}

async function request(path, options = {}) {
    const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;


    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        ...(options.body ? { body: options.body } : {}),
    };
    
    
    const response = await fetch(url, config);

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
}

export async function login({ phoneNo, password }) {
    const result = await request("api/v1/auth/login", {
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
    return request("api/v1/auth/profile/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getCommittees(token) {
    return request("api/v1/committee/get", {
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
    
    return request("api/v1/committee/add", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: bodyString,
    });
}

export async function logout(token) {
    return request("api/v1/auth/logout", {
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

    return request("api/v1/committee/member/add", {
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

    return request("api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(cleanData),
    });
}

export async function getCommitteeMembers(token, committeeId) {
    return request(`api/v1/committee/member/get?committeeId=${committeeId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getPaidAmountDrawWise(token, committeeId, drawId = null) {
    let url = `api/v1/committee/draw/user-wise-paid?committeeId=${committeeId}`;
    if (drawId) {
        url += `&drawId=${drawId}`;
    }
    return request(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getUserList(token) {
    return request("api/v1/auth/user-list", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getCommitteeDraws(token, committeeId) {
    return request(`api/v1/committee/draw/get?committeeId=${committeeId}`, {
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

    return request("api/v1/committee/draw/user-wise-paid", {
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

    return request("api/v1/auth/change-password", {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
    });
}