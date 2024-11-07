// src/components/dashboard/ThemeToggle.tsx
import React, { useState, useEffect } from 'react';
import { Check, Moon, Sun, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
  { id: 'light', name: 'Nord Light', icon: '🌕' },
  { id: 'dark', name: 'Nord Dark', icon: '🌑' },
  { id: 'theme-rosepine', name: 'Rose Pine', icon: '🌹' },
  { id: 'theme-catppuccin', name: 'Catppuccin', icon: '🐱' },
  { id: 'theme-onedark', name: 'One Dark', icon: '🌌' },
  { id: 'theme-kanagawa', name: 'Kanagawa', icon: '🌊' },
  { id: 'theme-dracula', name: 'Dracula', icon: '🧛' },
];

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      applyTheme(savedTheme);
      setIsDark(savedTheme.includes('dark'));
    } else {
      setIsDark(systemDark);
      applyTheme(systemDark ? 'dark' : 'light');
    }
  }, []);

  const applyTheme = (themeId) => {
    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark', ...themes.map(t => t.id));
    
    // Apply new theme
    document.documentElement.classList.add(themeId);
    localStorage.setItem('theme', themeId);
    setCurrentTheme(themeId);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Palette className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 py-2 bg-popover border border-border rounded-lg shadow-lg z-50"
          >
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  applyTheme(theme.id);
                  setShowThemePicker(false);
                  setIsDark(theme.id.includes('dark'));
                }}
                className="flex items-center w-full px-4 py-2 text-base-content hover:bg-muted transition-colors"
              >
                <span className="mr-2">{theme.icon}</span>
                <span className="flex-grow text-left">{theme.name}</span>
                {currentTheme === theme.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;