const VARIANTS = {
    primary:
        "bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/25 hover:bg-yellow-400 focus-visible:outline-yellow-300",
    secondary:
        "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white/50",
    ghost:
        "bg-transparent text-white hover:bg-white/10 focus-visible:outline-white/40",
};

const SIZES = {
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
};

export function Button({
    type = "button",
    variant = "primary",
    size = "md",
    className,
    isLoading = false,
    icon,
    children,
    ...props
}) {
    return (
        <button
            type={type}
            data-variant={variant}
            disabled={isLoading || props.disabled}
            className={classNames(
                "inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
                VARIANTS[variant],
                SIZES[size],
                className,
            )}
            {...props}
        >
            {isLoading && (
                <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            )}
            {icon && <span className="mr-2">{icon}</span>}
            <span>{children}</span>
        </button>
    );
}

function classNames(...values) {
    return values.filter(Boolean).join(" ");
}

