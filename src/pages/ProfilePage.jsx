import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { getProfile } from "../services/apiClient.js";
import { Button } from "../components/ui/Button.jsx";

export default function ProfilePage({ token, profile: initialProfile, onBack }) {
    const { showToast } = useToast();
    const [profile, setProfile] = useState(initialProfile);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (token && !initialProfile) {
            setIsLoading(true);
            setError("");
            getProfile(token)
                .then((data) => {
                    setProfile(data);
                })
                .catch((err) => {
                    setError(err.message || "Failed to load profile.");
                    showToast({
                        title: "Failed to load profile",
                        description: err.message || "Please try again later.",
                        variant: "error",
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [token, initialProfile, showToast]);

    const profileData = profile?.data ?? profile;
    const profileImage = profileData?.profileImage ?? profileData?.profileImg ?? null;
    const name = profileData?.name ?? "User";
    const email = profileData?.email ?? "—";
    const phoneNo = profileData?.phoneNo ?? profileData?.phone ?? "—";
    const role = profileData?.role ?? "—";
    const id = profileData?.id ?? "—";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-white">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
                    <p className="mt-4 text-sm text-white/70">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-white px-6">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-rose-200 mb-4">{error}</p>
                    {onBack && (
                        <Button variant="secondary" onClick={onBack}>
                            Go Back
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="text-white px-4 py-6 sm:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                {onBack && (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-4 sm:mb-6"
                    >
                        ← Back to Dashboard
                    </Button>
                )}
                
                <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 shadow-lg shadow-black/30">
                    <div className="px-2 sm:px-4 mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold text-white">My Profile</h1>
                        <p className="text-xs sm:text-sm text-white/70 mt-2">
                            View and manage your account information
                        </p>
                    </div>
                    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 pb-2 sm:pb-4">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-white/10">
                            <div className="relative">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={name}
                                        className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-yellow-400/30 object-cover"
                                    />
                                ) : (
                                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-yellow-400/30 bg-gradient-to-br from-yellow-400/20 to-purple-600/20 flex items-center justify-center">
                                        <span className="text-3xl sm:text-4xl font-bold text-yellow-300">
                                            {name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl sm:text-2xl font-semibold text-white">{name}</h2>
                                <p className="text-xs sm:text-sm text-white/60 mt-1">{role}</p>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    User ID
                                </label>
                                <p className="text-sm text-white/90 font-medium break-all">{id}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Role
                                </label>
                                <p className="text-sm text-white/90 font-medium">
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase ${
                                        role === "ADMIN" 
                                            ? "bg-yellow-400/20 text-yellow-200 border-yellow-300/30"
                                            : "bg-sky-400/20 text-sky-200 border-sky-300/30"
                                    }`}>
                                        {role}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-1 md:col-span-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Email Address
                                </label>
                                <p className="text-sm text-white/90 font-medium break-all">{email}</p>
                            </div>

                            <div className="space-y-1 md:col-span-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                    Phone Number
                                </label>
                                <p className="text-sm text-white/90 font-medium break-all">{phoneNo}</p>
                            </div>
                        </div>

                        {/* Additional Info Section */}
                        {profileData?.createdAt && (
                            <div className="pt-4 sm:pt-6 border-t border-white/10">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                                        Member Since
                                    </label>
                                    <p className="text-sm text-white/90 font-medium">
                                        {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

