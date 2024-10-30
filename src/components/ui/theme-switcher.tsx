// src/components/ui/theme-switcher.tsx
"use client"
import React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center space-x-2">
      <Sun 
        className={`h-5 w-5 transition-colors ${
          !isDark ? 'text-primary' : 'text-muted-foreground'
        }`} 
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => {
          setTheme(checked ? 'dark' : 'light');
        }}
        className="data-[state=checked]:bg-primary"
      />
      <Moon 
        className={`h-5 w-5 transition-colors ${
          isDark ? 'text-primary' : 'text-muted-foreground'
        }`} 
      />
    </div>
  );
}
