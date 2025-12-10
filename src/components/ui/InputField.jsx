import { forwardRef, useId } from "react";

export const InputField = forwardRef(function InputField(
    {
        label,
        description,
        error,
        type = "text",
        className = "",
        inputClassName = "",
        required,
        value,
        defaultValue,
        ...props
    },
    ref,
) {
    const autoId = useId();
    const id = props.id ?? autoId;
    const describedBy = [
        description ? `${id}-description` : null,
        error ? `${id}-error` : null,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <label className={`block text-left ${className}`} htmlFor={id}>
            {label && (
                <span className="text-sm font-medium text-white/90">
                    {label}
                    {required && <span className="ml-1 text-rose-300">*</span>}
                </span>
            )}
            {description && (
                <p
                    id={`${id}-description`}
                    className="mt-1 text-xs text-white/60"
                >
                    {description}
                </p>
            )}
            <input
                id={id}
                ref={ref}
                type={type}
                aria-describedby={describedBy || undefined}
                aria-invalid={Boolean(error)}
                className={`mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 ${inputClassName}`}
                required={required}
                value={value !== undefined ? value : undefined}
                defaultValue={value === undefined ? defaultValue : undefined}
                {...props}
            />
            {error && (
                <p
                    id={`${id}-error`}
                    className="mt-1 text-xs font-medium text-rose-300"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </label>
    );
});

