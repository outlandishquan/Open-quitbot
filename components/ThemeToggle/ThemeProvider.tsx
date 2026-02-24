'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    toggle: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    // Sync with localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('og-theme') as Theme | null;
        if (stored === 'light' || stored === 'dark') {
            setTheme(stored);
            document.documentElement.classList.toggle('light', stored === 'light');
        }
    }, []);

    const toggle = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('og-theme', next);
            document.documentElement.classList.toggle('light', next === 'light');
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}
