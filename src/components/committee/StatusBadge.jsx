export function StatusBadge({ status, subtle = false }) {
    const stateStyles = {
        ACTIVE: "bg-emerald-400/20 text-emerald-200 border-emerald-300/30",
        INACTIVE: "bg-rose-400/20 text-rose-200 border-rose-300/30",
        COMPLETE: "bg-amber-400/20 text-amber-200 border-amber-300/30",
        COMPLETED: "bg-amber-400/20 text-amber-200 border-amber-300/30",
        Active: "bg-emerald-400/20 text-emerald-200 border-emerald-300/30",
        Inactive: "bg-rose-400/20 text-rose-200 border-rose-300/30",
        Complete: "bg-amber-400/20 text-amber-200 border-amber-300/30",
        Completed: "bg-amber-400/20 text-amber-200 border-amber-300/30",
    };

    let normalized = "INACTIVE";
    if (typeof status === "string" && status.length > 0) {
        normalized = status.toUpperCase();
    } else if (status) {
        normalized = "ACTIVE";
    }

    // Normalize COMPLETED to COMPLETE for display consistency
    const displayText = normalized === "COMPLETED" ? "COMPLETE" : normalized;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                stateStyles[normalized] ?? "bg-white/10 text-white/70 border-white/20"
            } ${subtle ? "text-[0.7rem] px-2 py-0.5" : ""}`}
        >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            {displayText}
        </span>
    );
}

