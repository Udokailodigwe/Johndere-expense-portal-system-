import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

/**
 * Available theme options
 */
export const themes = {
  light: {
    name: "Light",
    class: "light",
    description: "Clean and bright interface",
  },
  dark: {
    name: "Dark",
    class: "dark",
    description: "Easy on the eyes for low-light environments",
  },
  auto: {
    name: "Auto",
    class: "auto",
    description: "Follows your system preference",
  },
};

/**
 * Theme provider component that manages theme state and persistence
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem("theme") || "light";
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = currentTheme === "auto" ? systemTheme : currentTheme;

    root.classList.remove("light", "dark");

    root.classList.add(effectiveTheme);

    localStorage.setItem("theme", currentTheme);
  }, [currentTheme, systemTheme]);

  const changeTheme = (theme) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
    }
  };

  const getCurrentThemeInfo = () => {
    const effectiveTheme = currentTheme === "auto" ? systemTheme : currentTheme;
    return {
      current: currentTheme,
      effective: effectiveTheme,
      info: themes[currentTheme],
    };
  };

  const value = {
    currentTheme,
    changeTheme,
    themes,
    getCurrentThemeInfo,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
