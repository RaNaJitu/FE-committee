import { navigation } from "../../constants/navigation.js";

export function MobileSidebar({ isOpen, onClose, activeNav, onSelectNav }) {
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
                    <a href="#home" className="text-2xl font-semibold text-white">
                        Aurora<span className="text-yellow-300">Board</span>
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
            </div>
            <div className="flex-1" onClick={onClose} aria-hidden />
        </div>
    );
}

