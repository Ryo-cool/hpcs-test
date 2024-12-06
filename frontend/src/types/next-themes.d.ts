declare module 'next-themes' {
    interface ThemeProviderProps {
        attribute?: string
        defaultTheme?: string
        children: React.ReactNode
    }

    interface UseThemeProps {
        theme: string | undefined
        setTheme: (theme: string) => void
        systemTheme?: string
        themes: string[]
    }

    export const ThemeProvider: React.FC<ThemeProviderProps>
    export function useTheme(): UseThemeProps
} 