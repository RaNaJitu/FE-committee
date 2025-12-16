import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import DashboardPage from "./DashboardPage.jsx";
import { getProfile, login, registerUser, forgotPassword } from "../services/apiClient.js";
import { saveSession } from "../services/sessionStorage.js";
import { normalizePassword } from "../utils/password.js";
import { validatePhoneNumber, validateEmail } from "../utils/validation.js";
import { AuthCard } from "../components/auth/AuthCard.jsx";
import { HeroSection } from "../components/auth/HeroSection.jsx";
import { BackgroundArt } from "../components/auth/BackgroundArt.jsx";
import { ForgotPasswordModal } from "../components/auth/ForgotPasswordModal.jsx";

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

export default function LoginPage({ onLogin }) {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState("login");
    const [loginValues, setLoginValues] = useState(initialLoginState);
    const [signupValues, setSignupValues] = useState(initialSignupState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [formError, setFormError] = useState("");
    const [signupError, setSignupError] = useState("");
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState("");

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

    const handleForgotPassword = () => {
        setIsForgotPasswordOpen(true);
    };

    const handleForgotPasswordSubmit = async (data) => {
        setIsResettingPassword(true);
        setForgotPasswordError("");

        // Note: The API requires a token, but for forgot password we might need a public token
        // or the user might need to be logged in. For now, we'll try without token first
        // and handle the error appropriately.
        try {

            await forgotPassword(data);
            showToast({
                title: "Password reset",
                description: "Your password has been reset successfully. Please sign in with your new password.",
                variant: "success",
            });
            setIsForgotPasswordOpen(false);
            // Switch to login mode after successful reset
            setAuthMode("login");
        } catch (err) {
            const message =
                err.message ||
                "Failed to reset password. Please verify your phone number and try again.";
            setForgotPasswordError(message);
            showToast({
                title: "Password reset failed",
                description: message,
                variant: "error",
            });
        } finally {
            setIsResettingPassword(false);
        }
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

        const phoneNo = loginValues.phoneNo.trim();
        const phoneError = validatePhoneNumber(phoneNo);
        if (phoneError) {
            setFormError(phoneError);
            showToast({
                title: "Invalid phone number",
                description: phoneError,
                variant: "error",
            });
            return;
        }

        setIsSubmitting(true);
        setFormError("");
        const normalizedPassword = normalizePassword(loginValues.password);

        login({ phoneNo, password: normalizedPassword })
            .then(async ({ token }) => {
                const profile = await getProfile(token);
                const newSession = {
                    isAuthenticated: true,
                    token,
                    profile,
                };
                saveSession({ token, profile });
                if (onLogin) {
                    onLogin(newSession);
                }
                showToast({
                    title: "Welcome back!",
                    description: `Logged in as ${profile.phoneNo ?? profile.email ?? phoneNo}`,
                    variant: "success",
                });
                setLoginValues(initialLoginState);
                navigate("/dashboard");
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

        const phoneNo = signupValues.phoneNo.trim();
        const email = signupValues.email.trim();

        const phoneError = validatePhoneNumber(phoneNo);
        if (phoneError) {
            setSignupError(phoneError);
            return;
        }

        const emailError = validateEmail(email);
        if (emailError) {
            setSignupError(emailError);
            return;
        }

        const payload = {
            name: signupValues.name.trim(),
            phoneNo,
            email,
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
                        onForgotPassword={handleForgotPassword}
                    />
                </div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => {
                    setIsForgotPasswordOpen(false);
                    setForgotPasswordError("");
                }}
                onSubmit={handleForgotPasswordSubmit}
                isSubmitting={isResettingPassword}
                error={forgotPasswordError}
            />
        </main>
    );
}
