import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loadSession, clearSession, saveSession } from "../services/sessionStorage.js";
import { getProfile } from "../services/apiClient.js";
import { setUnauthorizedHandler } from "../services/apiClient.js";
import { ROUTES } from "../constants/routes.js";

/**
 * Custom hook for authentication state management
 * @returns {Object} Auth state and methods
 */
export function useAuth() {
    const [session, setSession] = useState({
        isAuthenticated: false,
        token: "",
        profile: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Set up unauthorized handler
    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearSession();
            setSession({
                isAuthenticated: false,
                token: "",
                profile: null,
            });
            navigate(ROUTES.LOGIN);
        });
    }, [navigate]);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const saved = loadSession();
                if (saved?.token) {
                    try {
                        const profile = await getProfile(saved.token);
                        setSession({
                            isAuthenticated: true,
                            token: saved.token,
                            profile,
                        });
                    } catch (error) {
                        // Token invalid, clear session
                        clearSession();
                    }
                }
            } catch (error) {
                // Failed to restore session
                clearSession();
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = useCallback((newSession) => {
        setSession(newSession);
        saveSession({ token: newSession.token, profile: newSession.profile });
    }, []);

    const logout = useCallback(async () => {
        try {
            if (session.token) {
                const { logout: logoutApi } = await import("../services/apiClient.js");
                await logoutApi(session.token);
            }
        } catch (error) {
            // Continue with logout even if API call fails
        } finally {
            clearSession();
            setSession({
                isAuthenticated: false,
                token: "",
                profile: null,
            });
        }
    }, [session.token]);

    return {
        session,
        isLoading,
        login,
        logout,
        isAuthenticated: session.isAuthenticated,
        token: session.token,
        profile: session.profile,
    };
}

