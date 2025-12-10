export function Card({ className = "", children, ...props }) {
    return (
        <div
            className={`rounded-3xl border border-white/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/40 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = "", children, ...props }) {
    return (
        <div className={`border-b border-white/10 px-8 pb-6 pt-8 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className = "", children, ...props }) {
    return (
        <h2 className={`text-xl font-semibold text-white ${className}`} {...props}>
            {children}
        </h2>
    );
}

export function CardDescription({ className = "", children, ...props }) {
    return (
        <p className={`mt-2 text-sm text-white/60 ${className}`} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className = "", children, ...props }) {
    return (
        <div className={`px-8 py-6 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className = "", children, ...props }) {
    return (
        <div className={`flex flex-col gap-4 px-8 pb-8 pt-0 ${className}`} {...props}>
            {children}
        </div>
    );
}

