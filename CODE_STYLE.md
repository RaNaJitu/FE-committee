# Code Style Guide

This document outlines the coding standards and best practices for this project.

## General Principles

1. **Consistency**: Follow established patterns throughout the codebase
2. **Readability**: Write code that is easy to understand
3. **Maintainability**: Structure code for easy updates and modifications
4. **Performance**: Optimize for user experience
5. **Accessibility**: Ensure all users can interact with the application

## File Organization

```
src/
├── components/        # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── committee/    # Committee-related components
│   ├── layout/       # Layout components (header, sidebar, etc.)
│   └── ui/           # Generic UI components (Button, Input, etc.)
├── constants/        # Constants and configuration
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── pages/            # Page components (routes)
├── services/         # API clients and external services
└── utils/            # Utility functions
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (e.g., `Button.jsx`, `DashboardPage.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`, `validation.js`)
- **Constants**: camelCase (e.g., `routes.js`, `api.js`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`, `useDebounce.js`)

### Variables and Functions
- **Variables**: camelCase (e.g., `userName`, `isLoading`)
- **Functions**: camelCase (e.g., `handleSubmit`, `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_TIMEOUT`, `DEFAULT_DRAW_TIMER_SECONDS`)
- **Components**: PascalCase (e.g., `Button`, `DashboardPage`)

### Props
- Use descriptive names (e.g., `onSubmit`, `isLoading`, `userProfile`)
- Boolean props should start with `is`, `has`, `should`, or `can` (e.g., `isLoading`, `hasError`, `canEdit`)

## Component Structure

### Component Template

```jsx
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

/**
 * Component description
 * @param {Object} props - Component props
 * @param {string} props.propName - Prop description
 * @returns {JSX.Element} Component element
 */
export function ComponentName({ propName, ...props }) {
    // 1. Hooks
    const [state, setState] = useState();
    
    // 2. Effects
    useEffect(() => {
        // Effect logic
    }, []);
    
    // 3. Event handlers
    const handleEvent = () => {
        // Handler logic
    };
    
    // 4. Render
    return (
        <div>
            {/* Component JSX */}
        </div>
    );
}

ComponentName.propTypes = {
    propName: PropTypes.string.isRequired,
};

ComponentName.defaultProps = {
    propName: "default value",
};
```

## Code Formatting

### Indentation
- Use 4 spaces for indentation
- Use consistent spacing around operators and after commas

### Line Length
- Maximum 100 characters per line
- Break long lines at logical points

### Imports
- Group imports: external libraries, then internal modules
- Sort imports alphabetically within groups
- Use absolute imports from `src/` when possible

```jsx
// External libraries
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Internal modules
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
```

## Comments and Documentation

### JSDoc Comments
- Add JSDoc comments to all exported functions and components
- Document parameters, return values, and exceptions

```jsx
/**
 * Formats a date to display format
 * @param {string|Date} date - Date value to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    // Implementation
}
```

### Inline Comments
- Use comments to explain "why", not "what"
- Keep comments up to date with code changes
- Remove commented-out code before committing

## Error Handling

### Try-Catch Blocks
- Always handle errors appropriately
- Provide user-friendly error messages
- Log errors for debugging (development only)

```jsx
try {
    const result = await apiCall();
    // Handle success
} catch (error) {
    const message = getUserFriendlyErrorMessage(error);
    showToast({ title: "Error", description: message, variant: "error" });
}
```

### Error Boundaries
- Use Error Boundaries for component-level error handling
- Provide fallback UI for errors

## Performance

### React Optimization
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed as props
- Avoid unnecessary re-renders
- Use `React.memo` for pure components

### Code Splitting
- Lazy load routes and heavy components
- Split vendor code from application code

## Accessibility

### ARIA Labels
- Add `aria-label` to icon-only buttons
- Use `aria-describedby` for form field descriptions
- Mark error messages with `role="alert"`

### Semantic HTML
- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, etc.)
- Use proper heading hierarchy (h1 → h2 → h3)
- Ensure keyboard navigation works

### Form Labels
- Always associate labels with form inputs
- Use `htmlFor` and `id` attributes

## Testing Considerations

- Write testable code (pure functions where possible)
- Avoid side effects in render functions
- Keep components focused and single-purpose

## Git Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (e.g., "Add", "Fix", "Update", "Refactor")
- Reference issue numbers when applicable

## Resources

- [React Best Practices](https://react.dev/learn)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

