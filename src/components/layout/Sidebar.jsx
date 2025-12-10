import { navigation } from "../../constants/navigation.js";

export function Sidebar({ activeNav, onSelectNav }) {
    return (
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/70 px-6 py-8 backdrop-blur xl:flex">
            <div className="mb-10">
                <a href="#home" className="text-2xl font-semibold text-white">
                    Committees<span className="text-yellow-300">Board</span>
                </a>
                <p className="mt-2 text-sm text-white/50">
                    Committees command center
                </p>
            </div>
            <nav className="flex flex-1 flex-col gap-2">
                {navigation.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectNav(item.id)}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                            activeNav === item.id
                                ? "bg-yellow-400/20 text-yellow-200"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        <span>{item.label}</span>
                        {activeNav === item.id && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-yellow-300" />
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

