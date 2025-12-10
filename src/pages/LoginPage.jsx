import { useEffect, useMemo, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import DashboardPage from "./DashboardPage.jsx";
import { getProfile, login, logout, registerUser, setUnauthorizedHandler } from "../services/apiClient.js";
import { clearSession, loadSession, saveSession } from "../services/sessionStorage.js";
import { normalizePassword } from "../utils/password.js";
import { AuthCard } from "../components/auth/AuthCard.jsx";
import { HeroSection } from "../components/auth/HeroSection.jsx";
import { BackgroundArt } from "../components/auth/BackgroundArt.jsx";

const initialLoginState = {
    phoneNo: "",
    password: "",
    remember: false,
};

const initialSignupState = {
    name: "",
    phoneNo: "",
    email: "",
    password: "",
    role: "USER",
};

export default function LoginPage() {
    const { showToast } = useToast();
    const [authMode, setAuthMode] = useState("login");
    const [loginValues, setLoginValues] = useState(initialLoginState);
    const [signupValues, setSignupValues] = useState(initialSignupState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [formError, setFormError] = useState("");
    const [signupError, setSignupError] = useState("");
    const [isRestoringSession, setIsRestoringSession] = useState(true);
    const [session, setSession] = useState({
        isAuthenticated: false,
        token: "",
        profile: null,
    });

    const isLoginValid = useMemo(
        () =>
            loginValues.phoneNo?.trim() !== "" &&
            loginValues.password.trim() !== "",
        [loginValues.phoneNo, loginValues.password],
    );

    const isSignupValid = useMemo(
        () =>
            signupValues.name.trim() !== "" &&
            signupValues.phoneNo.trim() !== "" &&
            signupValues.email.trim() !== "" &&
            signupValues.password.trim() !== "" &&
            signupValues.role.trim() !== "",
        [signupValues],
    );

    // Restore session from storage on mount
    useEffect(() => {
        const restoreSession = async () => {
            const saved = loadSession();
            if (saved?.token) {
                try {
                    // Verify token is still valid by fetching profile
                    const profile = await getProfile(saved.token);
                    setSession({
                        isAuthenticated: true,
                        token: saved.token,
                        profile: profile || saved.profile,
                    });
                } catch (error) {
                    // Token is invalid or expired, clear session
                    clearSession();
                    setSession({
                        isAuthenticated: false,
                        token: "",
                        profile: null,
                    });
                }
            }
            setIsRestoringSession(false);
        };

        restoreSession();
    }, []);

    // Set up unauthorized handler to clear session on token expiration
    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearSession();
            setSession({
                isAuthenticated: false,
                token: "",
                profile: null,
            });
            showToast({
                title: "Session expired",
                description: "Your session has expired. Please sign in again.",
                variant: "warning",
            });
        });
    }, [showToast]);

    const handleLoginChange = (event) => {
        const { name, value, type, checked } = event.target;
        setLoginValues((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSignupChange = (event) => {
        const { name, value } = event.target;
        setSignupValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleModeChange = (mode) => {
        setAuthMode(mode);
        setFormError("");
        setSignupError("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isLoginValid) {
            showToast({
                title: "Missing fields",
                description: "Please enter both your phone number and password.",
                variant: "error",
            });
            return;
        }

        setIsSubmitting(true);
        setFormError("");
        const phoneNo = loginValues.phoneNo.trim();
        const normalizedPassword = normalizePassword(loginValues.password);

        login({ phoneNo, password: normalizedPassword })
            .then(async ({ token }) => {
                const profile = await getProfile(token);
                const newSession = {
                    isAuthenticated: true,
                    token,
                    profile,
                };
                setSession(newSession);
                saveSession({ token, profile });
                showToast({
                    title: "Welcome back!",
                    description: `Logged in as ${profile.phoneNo ?? profile.email ?? phoneNo}`,
                    variant: "success",
                });
                setLoginValues(initialLoginState);
            })
            .catch((error) => {
                const message =
                    error.message ||
                    "Unable to sign in. Please verify your credentials.";
                showToast({
                    title: "Login failed",
                    description: message,
                    variant: "error",
                });
                setFormError(message);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleSignupSubmit = (event) => {
        event.preventDefault();

        if (!isSignupValid) {
            setSignupError("Please complete all required fields.");
            return;
        }

        const payload = {
            name: signupValues.name.trim(),
            phoneNo: signupValues.phoneNo.trim(),
            email: signupValues.email.trim(),
            password: signupValues.password,
            role: signupValues.role,
        };

        setIsSigningUp(true);
        setSignupError("");

        registerUser(payload)
            .then(() => {
                showToast({
                    title: "Account created",
                    description: "You can now sign in with your new credentials.",
                    variant: "success",
                });
                setSignupValues(initialSignupState);
                setAuthMode("login");
            })
            .catch((error) => {
                const message =
                    error.message ||
                    "Unable to sign up. Please verify the details and try again.";
                setSignupError(message);
                showToast({
                    title: "Sign up failed",
                    description: message,
                    variant: "error",
                });
            })
            .finally(() => {
                setIsSigningUp(false);
            });
    };

    const handleLogout = () => {
        const { token } = session;
        
        const clearSessionState = () => {
            clearSession();
            setSession({
                isAuthenticated: false,
                token: "",
                profile: null,
            });
        };

        if (!token) {
            clearSessionState();
            return;
        }

        logout(token)
            .catch(() => {
                showToast({
                    title: "Unable to contact server",
                    description: "You have been signed out locally.",
                    variant: "warning",
                });
            })
            .finally(() => {
                clearSessionState();
                showToast({
                    title: "Signed out",
                    description: "You have been logged out successfully.",
                    variant: "info",
                });
            });
    };

    // Show loading state while restoring session
    if (isRestoringSession) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
                    <p className="mt-4 text-sm text-white/70">Loading...</p>
                </div>
            </main>
        );
    }

    if (session.isAuthenticated) {
        return (
            <DashboardPage
                profile={session.profile}
                token={session.token}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <BackgroundArt />
            <div className="relative z-10 flex min-h-screen w-full flex-col items-center gap-10 px-4 py-10 text-center sm:px-6 md:px-10 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-16 lg:py-0">
                <HeroSection />
                <div className="w-full max-w-md">
                    <AuthCard
                        authMode={authMode}
                        onModeChange={handleModeChange}
                        loginValues={loginValues}
                        signupValues={signupValues}
                        onLoginChange={handleLoginChange}
                        onSignupChange={handleSignupChange}
                        onLoginSubmit={handleSubmit}
                        onSignupSubmit={handleSignupSubmit}
                        isSubmitting={isSubmitting}
                        isSigningUp={isSigningUp}
                        formError={formError}
                        signupError={signupError}
                        isLoginValid={isLoginValid}
                        isSignupValid={isSignupValid}
                    />
                </div>
            </div>
        </main>
    );
}
