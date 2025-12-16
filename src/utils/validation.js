/**
 * Validation utilities for phone numbers, emails, and other inputs
 */

/**
 * Validates a phone number
 * Supports formats: 10 digits, with or without country code, with or without dashes/spaces
 * @param {string} phoneNo - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNo) {
    if (!phoneNo || typeof phoneNo !== "string") {
        return false;
    }

    // Remove all non-digit characters
    const digitsOnly = phoneNo.replace(/\D/g, "");

    // Check if it's between 10 and 15 digits (international format)
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidEmail(email) {
    if (!email || typeof email !== "string") {
        return false;
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validates a phone number and returns an error message if invalid
 * @param {string} phoneNo - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validatePhoneNumber(phoneNo) {
    if (!phoneNo || !phoneNo.trim()) {
        return "Phone number is required.";
    }

    if (!isValidPhoneNumber(phoneNo)) {
        return "Please enter a valid phone number (10-15 digits).";
    }

    return null;
}

/**
 * Validates an email and returns an error message if invalid
 * @param {string} email - Email to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateEmail(email) {
    if (!email || !email.trim()) {
        return "Email is required.";
    }

    if (!isValidEmail(email)) {
        return "Please enter a valid email address.";
    }

    return null;
}

/**
 * Validates a password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 6)
 * @returns {string|null} - Error message or null if valid
 */
export function validatePassword(password, minLength = 6) {
    if (!password || !password.trim()) {
        return "Password is required.";
    }

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long.`;
    }

    return null;
}

/**
 * Validates a positive number
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum value (default: 0)
 * @returns {string|null} - Error message or null if valid
 */
export function validatePositiveNumber(value, min = 0) {
    if (value === null || value === undefined || value === "") {
        return "This field is required.";
    }

    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) {
        return "Please enter a valid number.";
    }

    if (num < min) {
        return `Value must be ${min} or greater.`;
    }

    return null;
}

