import { Button } from "../ui/Button.jsx";
import { ProfileDropdown } from "./ProfileDropdown.jsx";

export function DashboardHeader({ profile, token, onOpenMobileNav, onViewProfile, onLogout }) {
    return (
        <header className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/70 px-6 py-8 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div className="flex items-start justify-between gap-4 w-full">
                <div className="flex-1">
                    {/* <p className="text-sm uppercase tracking-wider text-yellow-300">
                        Dashboard
                    </p> */}
                    <h1 className="mt-2 text-3xl font-semibold text-white">
                        Welcome to
                        <span className="text-yellow-300"> { profile.data?.name }</span>
                    </h1>
                    <p className="mt-2 text-sm text-white/60">
                        You are signed in as{" "}
                        <span className="text-white">{profile?.data?.email}</span>
                        {profile?.data?.role ? ` · ${profile?.data?.role}` : ""}
                        .
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenMobileNav}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
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

