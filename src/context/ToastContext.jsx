import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

const VARIANT_STYLES = {
    success: {
        container:
            "border border-emerald-500/50 bg-emerald-500/15 text-emerald-50 shadow-emerald-900/40",
        iconBg: "bg-emerald-500 text-emerald-900",
    },
    error: {
        container:
            "border border-rose-500/50 bg-rose-500/15 text-rose-50 shadow-rose-900/40",
        iconBg: "bg-rose-500 text-rose-900",
    },
    warning: {
        container:
            "border border-amber-500/50 bg-amber-500/15 text-amber-50 shadow-amber-900/40",
        iconBg: "bg-amber-400 text-amber-900",
    },
    info: {
        container:
            "border border-sky-500/50 bg-sky-500/15 text-sky-50 shadow-sky-900/40",
        iconBg: "bg-sky-400 text-sky-900",
    },
};

const getVariantStyles = (variant = "info") =>
    VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;

const createToastId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            Object.values(timersRef.current).forEach(clearTimeout);
            timersRef.current = {};
        };
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
    }, []);

    const showToast = useCallback((toastInput) => {
        const {
            title,
            description,
            variant = "info",
            duration = 4000,
            id = createToastId(),
            action,
        } = toastInput;

        setToasts((current) => [
            ...current.filter((toast) => toast.id !== id),
            {
                id,
                title,
                description,
                variant,
                duration,
                action,
            },
        ]);

        if (duration !== Infinity) {
            if (timersRef.current[id]) {
                clearTimeout(timersRef.current[id]);
            }

            timersRef.current[id] = setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const value = useMemo(
        () => ({
            showToast,
            dismissToast: removeToast,
        }),
        [showToast, removeToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            {isMounted &&
                createPortal(
                    <div className="pointer-events-none fixed inset-0 z-[2000] flex flex-col items-end gap-3 overflow-hidden p-4 sm:p-6">
                        {toasts.map((toast) => (
                            <ToastCard
                                key={toast.id}
                                {...toast}
                                onDismiss={() => removeToast(toast.id)}
                            />
                        ))}
                    </div>,
                    document.body,
                )}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

function ToastCard({
    id,
    title,
    description,
    variant = "info",
    action,
    onDismiss,
}) {
    const styles = getVariantStyles(variant);

    return (
        <div
            role="status"
            aria-live="polite"
            data-toast-id={id}
            className={`pointer-events-auto w-full max-w-sm transform rounded-xl border bg-opacity-80 shadow-lg backdrop-blur supports-[backdrop-filter]:backdrop-blur-md transition-all hover:translate-y-[-2px] ${styles.container}`}
        >
            <div className="flex items-start gap-3 p-4">
                <div
                    className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-base font-semibold ${styles.iconBg}`}
                >
                    {getVariantIcon(variant)}
                </div>
                <div className="flex-1">
                    {title && (
                        <p className="font-semibold leading-tight tracking-tight">
                            {title}
                        </p>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-white/80">
                            {description}
                        </p>
                    )}
                    {action?.label && typeof action.onClick === "function" && (
                        <button
                            type="button"
                            onClick={() => {
                                action.onClick();
                                if (!action.persistent) {
                                    onDismiss();
                                }
                            }}
                            className="mt-3 inline-flex items-center justify-center rounded-md bg-white/10 px-3 py-1 text-sm font-medium text-white transition hover:bg-white/20"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="ml-2 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label="Dismiss notification"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

function getVariantIcon(variant) {
    switch (variant) {
    case "success":
        return "✓";
    case "error":
        return "!";
    case "warning":
        return "⚠";
    default:
        return "ℹ";
    }
}

