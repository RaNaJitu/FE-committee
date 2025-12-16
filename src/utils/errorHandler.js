/**
 * Standardized error handling utilities
 */

/**
 * Extract error message from error object
 * @param {Error|Object|string} error - Error object or message
 * @param {string} defaultMessage - Default message if error is not parseable
 * @returns {string} Error message
 */
export function getErrorMessage(error, defaultMessage = "An unexpected error occurred") {
    if (!error) return defaultMessage;
    
    if (typeof error === "string") {
        return error;
    }
    
    if (error instanceof Error) {
        return error.message || defaultMessage;
    }
    
    if (error?.message) {
        return error.message;
    }
    
    if (error?.error) {
        return typeof error.error === "string" ? error.error : error.error.message || defaultMessage;
    }
    
    return defaultMessage;
}

/**
 * Check if error is a network error
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
    if (!error) return false;
    
    if (error.name === "NetworkError" || error.name === "TypeError") {
        return true;
    }
    
    if (error.message?.toLowerCase().includes("network") || 
        error.message?.toLowerCase().includes("fetch")) {
        return true;
    }
    
    return false;
}

/**
 * Check if error is a timeout error
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if timeout error
 */
export function isTimeoutError(error) {
    if (!error) return false;
    
    return error.name === "TimeoutError" || 
           error.name === "AbortError" ||
           error.message?.toLowerCase().includes("timeout");
}

/**
 * Get user-friendly error message based on error type
 * @param {Error|Object|string} error - Error object
 * @param {Object} options - Options for error message
 * @param {string} options.defaultMessage - Default error message
 * @param {string} options.networkMessage - Message for network errors
 * @param {string} options.timeoutMessage - Message for timeout errors
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error, options = {}) {
    const {
        defaultMessage = "An unexpected error occurred. Please try again.",
        networkMessage = "Network error. Please check your connection and try again.",
        timeoutMessage = "Request timed out. Please try again.",
    } = options;
    
    if (isTimeoutError(error)) {
        return timeoutMessage;
    }
    
    if (isNetworkError(error)) {
        return networkMessage;
    }
    
    return getErrorMessage(error, defaultMessage);
}

