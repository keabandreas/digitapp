import React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isLight = theme === 'nordlight';

  return (
    <div className="flex items-center space-x-2">
      <Sun className={`h-4 w-4 transition-all ${isLight ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch
        checked={!isLight}
        onCheckedChange={(checked) => {
          setTheme(checked ? 'norddark' : 'nordlight');
        }}
        className="data-[state=checked]:bg-primary"
      />
      <Moon className={`h-4 w-4 transition-all ${!isLight ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
}
