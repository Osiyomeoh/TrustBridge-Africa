import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neon-green/50 dark:bg-dark-gray dark:border dark:border-neon-green/30 dark:hover:border-neon-green/50 light:bg-light-border light:border light:border-light-accent/30 light:hover:border-light-accent/50"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
          theme === 'light' 
            ? 'translate-x-6 bg-light-accent' 
            : 'translate-x-0 bg-neon-green'
        }`}
      >
        {theme === 'light' ? (
          <Sun className="w-3 h-3 text-white" />
        ) : (
          <Moon className="w-3 h-3 text-black" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
