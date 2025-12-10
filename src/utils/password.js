/**
 * Normalizes password input by removing surrounding quotes if present
 * @param {string} value - The password value to normalize
 * @returns {string} - The normalized password
 */
export function normalizePassword(value) {
    if (typeof value !== "string") {
        return "";
    }

    const trimmed = value.trim();
    if (trimmed.length >= 2) {
        const first = trimmed.at(0);
        const last = trimmed.at(-1);
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
            return trimmed.slice(1, -1);
        }
    }
    return trimmed;
}

