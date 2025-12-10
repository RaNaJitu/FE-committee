export function Badge({ children }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-yellow-200">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            {children}
        </span>
    );
}

