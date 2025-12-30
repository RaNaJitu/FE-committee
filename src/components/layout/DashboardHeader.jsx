import { Button } from "../ui/Button.jsx";
import { ProfileDropdown } from "./ProfileDropdown.jsx";

export function DashboardHeader({ profile, token, onOpenMobileNav, onViewProfile, onLogout }) {
    return (
        <header className="fixed top-0 right-0 left-0 xl:left-72 z-50 flex flex-col gap-3 sm:gap-4 border-b border-white/10 bg-slate-950/70 px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-8 backdrop-blur lg:flex-row lg:items-center lg:justify-between ">
            <div className="flex items-start justify-between gap-3 sm:gap-4 w-full">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white leading-tight">
                        Welcome to
                        <span className="text-yellow-300"> {profile.data?.name || "User"}</span>
                    </h1>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/60 leading-snug">
                        You are signed in as{" "}
                        <span className="text-white break-all">{profile?.data?.email}</span>
                        {profile?.data?.role ? ` · ${profile?.data?.role}` : ""}
                        .
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onOpenMobileNav}
                        className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
                        aria-label="Open navigation menu"
                    >
                        <span className="flex flex-col gap-1.5">
                            <span className="mx-auto h-1 w-1 rounded-full bg-white" />
                            <span className="mx-auto h-1 w-1 rounded-full bg-white" />
                            <span className="mx-auto h-1 w-1 rounded-full bg-white" />
                        </span>
                    </button>
                    <ProfileDropdown
                        profile={profile}
                        token={token}
                        onViewProfile={onViewProfile}
                        onLogout={onLogout}
                    />
                </div>
            </div>
        </header>
    );
}

