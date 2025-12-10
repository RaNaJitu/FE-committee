const STORAGE_KEY = "committee_session";

export function saveSession({ token, profile }) {
    try {
        const data = {
            token,
            profile,
            timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save session:", error);
    }
}

export function loadSession() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        
        const parsed = JSON.parse(data);
        return {
            token: parsed.token || "",
            profile: parsed.profile || null,
        };
    } catch (error) {
        console.error("Failed to load session:", error);
        return null;
    }
}

export function clearSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear session:", error);
    }
}

