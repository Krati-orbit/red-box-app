import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    // 1. Initialize state based on localStorage OR system preference
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('redbox-theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Fallback to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark'; // Default to dark if no preference
    });

    // 2. Whenever the theme changes, update document element and localStorage
    useEffect(() => {
        // Set the data-theme attribute on the HTML root tag
        document.documentElement.setAttribute('data-theme', theme);
        // Save choice to localStorage
        localStorage.setItem('redbox-theme', theme);
    }, [theme]);

    // 3. Toggle helper function
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
