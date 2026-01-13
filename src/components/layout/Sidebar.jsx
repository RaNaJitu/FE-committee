import { Link, useLocation } from "react-router-dom";
import { navigation } from "../../constants/navigation.js";

export function Sidebar({ activeNav }) {
    const location = useLocation();
    
    // Map navigation IDs to routes
    const getRoute = (id) => {
        switch (id) {
            case "committees":
                return "/dashboard";
            case "calendar":
                return "/calendar";
            case "profile":
                return "/profile";
            case "documents":
                return "/documents";
            case "overview":
                return "/overview";
            default:
                return "/dashboard";
        }
    };
    
    // Determine active nav from location
    const currentActiveNav = location.pathname === "/profile" || location.pathname.startsWith("/profile/")
        ? "profile"
        : location.pathname === "/calendar" || location.pathname.startsWith("/calendar/")
        ? "calendar"
        : location.pathname === "/overview" || location.pathname.startsWith("/overview/")
        ? "overview"
        : location.pathname === "/documents" || location.pathname.startsWith("/documents/")
        ? "documents"
        : location.pathname === "/committees" || location.pathname.startsWith("/committees/") || location.pathname.startsWith("/dashboard")
        ? "committees"
        : "committees";

    return (
        <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-slate-950/70 px-6 py-8 backdrop-blur xl:flex">
            <div className="mb-10">
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
        </aside>
    );
}

