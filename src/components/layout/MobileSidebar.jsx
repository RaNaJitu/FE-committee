import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../../constants/navigation.js";

export function MobileSidebar({ isOpen, onClose, activeNav }) {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Map navigation IDs to routes
    const getRoute = (id) => {
        switch (id) {
            case "committees":
                return "/dashboard";
            case "calendar":
                return "/dashboard/calendar";
            case "profile":
                return "/dashboard/profile";
            default:
                return "/dashboard";
        }
    };
    
    // Determine active nav from location
    const currentActiveNav = location.pathname.includes("/profile")
        ? "profile"
        : location.pathname.includes("/calendar")
        ? "calendar"
        : location.pathname.includes("/committee/")
        ? "committees"
        : "committees";
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[1200] flex bg-slate-950/80 backdrop-blur-sm lg:hidden">
            <div className="relative flex min-h-full w-72 flex-col border-r border-white/10 bg-slate-950 px-6 py-8">
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    onClick={onClose}
                    aria-label="Close navigation"
                >
                    ✕
                </button>
                <div className="mb-10 mt-6">
                    <Link to="/dashboard" className="text-2xl font-semibold text-white">
                        Committees<span className="text-yellow-300">Board</span>
                    </Link>
                    <p className="mt-2 text-sm text-white/50">
                        Committees command center
                    </p>
                </div>
                <nav className="flex flex-1 flex-col gap-2">
                    {navigation.map((item) => {
                        const route = getRoute(item.id);
                        const isActive = currentActiveNav === item.id;
                        
                        return (
                            <Link
                                key={item.id}
                                to={route}
                                onClick={onClose}
                                className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                                    isActive
                                        ? "bg-yellow-400/20 text-yellow-200"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <span>{item.label}</span>
                                {isActive && (
                                    <span className="inline-flex h-2 w-2 rounded-full bg-yellow-300" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="flex-1" onClick={onClose} aria-hidden />
        </div>
    );
}

