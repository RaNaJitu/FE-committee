import { createPortal } from "react-dom";

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
}) {
    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} aria-hidden />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                className="relative z-10 w-full max-w-4xl max-h-[90vh] mx-4 rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-white shadow-2xl shadow-black/30 overflow-hidden flex flex-col"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
                    aria-label="Close dialog"
                >
                    ×
                </button>
                <div className="flex-shrink-0">
                    {title && (
                        <h2 id="modal-title" className="text-xl font-semibold">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="mt-2 text-sm text-white/70">{description}</p>
                    )}
                </div>
                <div className="mt-6 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
                {footer && <div className="mt-8 flex-shrink-0">{footer}</div>}
            </div>
        </div>,
        document.body,
    );
}

