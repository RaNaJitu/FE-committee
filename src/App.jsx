import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import { DashboardHeader } from "./components/layout/DashboardHeader.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { MobileSidebar } from "./components/layout/MobileSidebar.jsx";
import { loadSession, clearSession } from "./services/sessionStorage.js";
import { getProfile } from "./services/apiClient.js";
import { setUnauthorizedHandler } from "./services/apiClient.js";

function ProtectedLayout({ children, onLogout, token, profile, onOpenMobileNav }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const location = useLocation();

    // Get active nav from URL path
    const activeNav = location.pathname === "/profile" || location.pathname.startsWith("/profile/")
        ? "profile"
        : location.pathname === "/calendar" || location.pathname.startsWith("/calendar/")
        ? "calendar"
        : location.pathname === "/overview" || location.pathname.startsWith("/overview/")
        ? "overview"
        : location.pathname === "/documents" || location.pathname.startsWith("/documents/")
        ? "documents"
        : location.pathname === "/committees" || location.pathname.startsWith("/dashboard/") || location.pathname.startsWith("/dashboard")
        ? "committees"
        : "committees";

    // Handle mobile nav open
    const handleOpenMobileNav = () => {
        setIsMobileNavOpen(true);
        if (onOpenMobileNav) {
            onOpenMobileNav();
        }
    };

    // Recursively inject onOpenMobileNav into DashboardHeader components
    const injectMobileNavHandler = (element) => {
        if (!React.isValidElement(element)) {
            return element;
        }

        // Check if this element has onOpenMobileNav prop (likely DashboardHeader)
        // or if it's the DashboardHeader component
        const hasMobileNavProp = element.props && element.props.onOpenMobileNav !== undefined;
        const isDashboardHeader = 
            element.type === DashboardHeader || 
            element.type?.displayName === 'DashboardHeader' ||
            element.type?.name === 'DashboardHeader';

        // If this is DashboardHeader or has onOpenMobileNav prop, inject the handler
        if (isDashboardHeader || hasMobileNavProp) {
            return React.cloneElement(element, {
                ...element.props,
                onOpenMobileNav: handleOpenMobileNav,
            });
        }

        // If it has children, recursively process them
        if (element.props && element.props.children) {
            const children = React.Children.map(element.props.children, injectMobileNavHandler);
            return React.cloneElement(element, {
                ...element.props,
                children,
            });
        }

        return element;
    };

    const processedChildren = React.Children.map(children, injectMobileNavHandler);

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <Sidebar activeNav={activeNav} />
            <MobileSidebar
                isOpen={isMobileNavOpen}
                onClose={() => setIsMobileNavOpen(false)}
                activeNav={activeNav}
            />
            <main className="flex-1 overflow-hidden xl:ml-72">
                {processedChildren}
            </main>
        </div>
    );
}

function AppContent({ session, handleLogout, setSession }) {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    session.isAuthenticated ? (
                        <Navigate to="/committees" replace />
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
                path="/profile"
                element={
                    session.isAuthenticated ? (
                        <ProtectedLayout onLogout={handleLogout} token={session.token} profile={session.profile}>
                            <DashboardHeader
                                profile={session.profile}
                                token={session.token}
                                onOpenMobileNav={() => {}}
                                onViewProfile={() => navigate("/profile")}
                                onLogout={handleLogout}
                            />
                            <div className="pt-32 px-6 py-8 lg:px-12">
                                <ProfilePage
                                    token={session.token}
                                    profile={session.profile}
                                    onBack={() => navigate("/committees")}
                                />
                            </div>
                        </ProtectedLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/calendar"
                element={
                    session.isAuthenticated ? (
                        <ProtectedLayout onLogout={handleLogout} token={session.token} profile={session.profile}>
                            <DashboardHeader
                                profile={session.profile}
                                token={session.token}
                                onOpenMobileNav={() => {}}
                                onViewProfile={() => navigate("/profile")}
                                onLogout={handleLogout}
                            />
                            <div className="pt-32 px-6 py-8 lg:px-12">
                                <CalendarPage />
                            </div>
                        </ProtectedLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/overview"
                element={
                    session.isAuthenticated ? (
                        <ProtectedLayout onLogout={handleLogout} token={session.token} profile={session.profile}>
                            <DashboardHeader
                                profile={session.profile}
                                token={session.token}
                                onOpenMobileNav={() => {}}
                                onViewProfile={() => navigate("/profile")}
                                onLogout={handleLogout}
                            />
                            <div className="pt-32 px-6 py-8 lg:px-12">
                                <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 mb-4">
                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-semibold text-white">Coming Soon</h3>
                                        <p className="text-sm sm:text-base text-white/60 max-w-md mx-auto">
                                            The Overview page is currently under development. Check back soon for detailed insights and statistics.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ProtectedLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/documents"
                element={
                    session.isAuthenticated ? (
                        <ProtectedLayout onLogout={handleLogout} token={session.token} profile={session.profile}>
                            <DashboardHeader
                                profile={session.profile}
                                token={session.token}
                                onOpenMobileNav={() => {}}
                                onViewProfile={() => navigate("/profile")}
                                onLogout={handleLogout}
                            />
                            <div className="pt-32 px-6 py-8 lg:px-12">
                                <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 mb-4">
                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-semibold text-white">Coming Soon</h3>
                                        <p className="text-sm sm:text-base text-white/60 max-w-md mx-auto">
                                            The Documents page is currently under development. Check back soon to view and manage documents.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ProtectedLayout>
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
    );
}

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
            <AppContent session={session} handleLogout={handleLogout} setSession={setSession} />
        </BrowserRouter>
    );
}

export default App;
