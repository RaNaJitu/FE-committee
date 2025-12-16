/**
 * Error tracking utility
 * Integrate with error monitoring service (Sentry, LogRocket, etc.)
 */

let errorTrackingEnabled = false;
let errorTracker = null;

/**
 * Initialize error tracking
 * Call this in main.jsx or App.jsx
 * @param {Object} config - Configuration for error tracking service
 */
export function initErrorTracking(config = {}) {
    // Check if error tracking is enabled via environment variable
    errorTrackingEnabled = import.meta.env.VITE_ENABLE_ERROR_TRACKING === "true";

    if (!errorTrackingEnabled) {
        return;
    }

    // Example: Initialize Sentry
    // Uncomment and configure when ready to use Sentry
    /*
    import * as Sentry from "@sentry/react";
    
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
    });
    
    errorTracker = Sentry;
    */

    // Example: Initialize LogRocket
    // Uncomment and configure when ready to use LogRocket
    /*
    import LogRocket from 'logrocket';
    
    LogRocket.init(import.meta.env.VITE_LOGROCKET_APP_ID);
    errorTracker = LogRocket;
    */
}

/**
 * Capture an error
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export function captureError(error, context = {}) {
    if (!errorTrackingEnabled || !errorTracker) {
        // In development, log to console
        if (import.meta.env.DEV) {
            console.error("Error captured:", error, context);
        }
        return;
    }

    // Example: Sentry
    // errorTracker.captureException(error, { extra: context });

    // Example: LogRocket
    // errorTracker.captureException(error, { tags: context });
}

/**
 * Capture a message
 * @param {string} message - The message to capture
 * @param {string} level - Log level (info, warning, error)
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = "info", context = {}) {
    if (!errorTrackingEnabled || !errorTracker) {
        if (import.meta.env.DEV) {
            console[level](message, context);
        }
        return;
    }

    // Example: Sentry
    // errorTracker.captureMessage(message, { level, extra: context });
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
export function setUserContext(user) {
    if (!errorTrackingEnabled || !errorTracker) {
        return;
    }

    // Example: Sentry
    // errorTracker.setUser(user);

    // Example: LogRocket
    // errorTracker.identify(user.id, user);
}

