import { createContext, useContext, useState } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  bg: string;
  cardBg: string;
  textColor: string;
  subColor: string;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  bg: '#fff',
  cardBg: '#f9f9f9',
  textColor: '#333',
  subColor: '#999',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  const bg = darkMode ? '#1a1a1a' : '#fff';
  const cardBg = darkMode ? '#2a2a2a' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#333';
  const subColor = darkMode ? '#aaa' : '#999';

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, bg, cardBg, textColor, subColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);