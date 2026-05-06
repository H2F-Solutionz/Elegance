import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type ColorTheme = "pink" | "violet" | "emerald" | "gold";
export type Radius = "0" | "0.5" | "1.0";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    defaultColor?: ColorTheme;
    defaultRadius?: Radius;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    color: ColorTheme;
    setColor: (color: ColorTheme) => void;
    radius: Radius;
    setRadius: (radius: Radius) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    color: "pink",
    setColor: () => null,
    radius: "0.5",
    setRadius: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Define aesthetic color palettes referencing HSL values for the --primary variable
const colorPalettes: Record<ColorTheme, string> = {
    pink: "330 80% 55%", // Default vibrant pink
    violet: "260 80% 60%", // Aesthetic violet
    emerald: "150 70% 45%", // Deep emerald green
    gold: "43 74% 49%", // Original gold
};

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultColor = "pink",
    defaultRadius = "0.5",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(`${storageKey}-theme`) as Theme) || defaultTheme
    );

    const [color, setColor] = useState<ColorTheme>(
        () => (localStorage.getItem(`${storageKey}-color`) as ColorTheme) || defaultColor
    );

    const [radius, setRadius] = useState<Radius>(
        () => (localStorage.getItem(`${storageKey}-radius`) as Radius) || defaultRadius
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Set color variable
        root.style.setProperty("--primary", colorPalettes[color]);
        root.style.setProperty("--ring", colorPalettes[color]);

        // Set radius variable
        root.style.setProperty("--radius", `${radius}rem`);

    }, [color, radius]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(`${storageKey}-theme`, theme);
            setTheme(theme);
        },
        color,
        setColor: (newColor: ColorTheme) => {
            localStorage.setItem(`${storageKey}-color`, newColor);
            setColor(newColor);
        },
        radius,
        setRadius: (newRadius: Radius) => {
            localStorage.setItem(`${storageKey}-radius`, newRadius);
            setRadius(newRadius);
        }
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
