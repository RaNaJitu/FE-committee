import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button.jsx";
import { ChangePasswordModal } from "../auth/ChangePasswordModal.jsx";
import { changePassword } from "../../services/apiClient.js";
import { useToast } from "../../context/ToastContext.jsx";

export function ProfileDropdown({ profile, token, onViewProfile, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { showToast } = useToast();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState("");

    const profileData = profile?.data ?? profile;
    const name = profileData?.name ?? "User";
    const email = profileData?.email ?? "";
    const role = profileData?.role ?? "";
    const profileImage = profileData?.profileImage ?? profileData?.profileImg ?? null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
                aria-label="Profile menu"
            >
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt={name}
                        className="h-8 w-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400/30 to-purple-600/30 flex items-center justify-center">
                        <span className="text-sm font-semibold text-yellow-300">
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="hidden text-left sm:block">
                    <p className="text-xs font-medium text-white">{name}</p>
                    <p className="text-xs text-white/60">{email}</p>
                </div>
                <svg
                    className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-lg z-50">
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={name}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400/30 to-purple-600/30 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-yellow-300">
                                        {name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{name}</p>
                                <p className="text-xs text-white/60 truncate">{email}</p>
                                {role && (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${
                                        role === "ADMIN"
                                            ? "bg-yellow-400/20 text-yellow-200"
                                            : "bg-sky-400/20 text-sky-200"
                                    }`}>
                                        {role}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onViewProfile?.();
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                View Profile
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setIsChangePasswordOpen(true);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Change Password
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onLogout?.();
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => {
                    setIsChangePasswordOpen(false);
                    setChangePasswordError("");
                }}
                onSubmit={async (data) => {
                    if (!token) {
                        setChangePasswordError("Authentication token is missing.");
                        showToast({
                            title: "Error",
                            description: "Authentication token is missing.",
                            variant: "error",
                        });
                        return;
                    }

                    setIsChangingPassword(true);
                    setChangePasswordError("");

                    try {
                        await changePassword(token, data);
                        showToast({
                            title: "Password changed",
                            description: "Your password has been updated successfully.",
                            variant: "success",
                        });
                        setIsChangePasswordOpen(false);
                    } catch (err) {
                        const message =
                            err.message ||
                            "Failed to change password. Please check your current password and try again.";
                        setChangePasswordError(message);
                        showToast({
                            title: "Password change failed",
                            description: message,
                            variant: "error",
                        });
                    } finally {
                        setIsChangingPassword(false);
                    }
                }}
                isSubmitting={isChangingPassword}
                error={changePasswordError}
            />
        </div>
    );
}

