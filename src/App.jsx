import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import { loadSession, clearSession } from "./services/sessionStorage.js";
import { getProfile } from "./services/apiClient.js";
import { setUnauthorizedHandler } from "./services/apiClient.js";

function App() {
    const [session, setSession] = useState({
        isAuthenticated: false,
        token: "",
        profile: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Set up unauthorized handler
    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearSession();
            setSession({
                isAuthenticated: false,
                token: "",
                profile: null,
            });
        });
    }, []);

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

    const handleLogout = async () => {
        try {
            if (session.token) {
                const { logout } = await import("./services/apiClient.js");
                await logout(session.token);
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
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-yellow-400 border-r-transparent"></div>
                    <p className="mt-4 text-sm text-white/60">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        session.isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <LoginPage
                                onLogin={(newSession) => {
                                    setSession(newSession);
                                }}
                            />
                        )
                    }
                />
                <Route
                    path="/dashboard/*"
                    element={
                        session.isAuthenticated ? (
                            <DashboardPage
                                token={session.token}
                                profile={session.profile}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/"
                    element={
                        <Navigate
                            to={session.isAuthenticated ? "/dashboard" : "/login"}
                            replace
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
