// src/components/dashboard/BentoGrid.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Database, BarChart3, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import Window from './Window';
import ShortcutsModal from './ShortcutsModal';
import { BentoItem } from '@/components/dashboard/types';

const HostApps = dynamic(() => import('@/pages/hostapps'), { ssr: false });
const Statistics = dynamic(() => import('@/pages/statistics'), { ssr: false });
const Wiki = dynamic(() => import('@/pages/wiki'), { ssr: false });

export const BentoGrid = () => {
  const [activeWindow, setActiveWindow] = useState<BentoItem | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const items: BentoItem[] = [
    {
      title: "Host Applications",
      description: "Manage and monitor your host applications",
      icon: <Database className="w-6 h-6 text-info" />,
      className: "md:col-span-2",
      component: <HostApps />,
      hoverColor: "hover:bg-info/20"
    },
    {
      title: "Statistics",
      description: "View system statistics and analytics",
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      className: "row-span-2",
      component: <Statistics />,
      hoverColor: "hover:bg-primary/20"
    },
    {
      title: "Wiki",
      description: "Access documentation and guides",
      icon: <BookOpen className="w-6 h-6 text-secondary" />,
      className: "md:col-span-2",
      component: <Wiki />,
      hoverColor: "hover:bg-secondary/20"
    }
  ];

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.altKey && !isNaN(Number(e.key))) {
        e.preventDefault();
        const num = parseInt(e.key);
        if (num > 0 && num <= items.length) {
          setActiveWindow(items[num - 1]);
        }
      }
      
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [items]);
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {items.map((item, i) => (
          <motion.button 
            key={i}
            onClick={() => setActiveWindow(item)}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border",
              "bg-card/80 backdrop-blur-sm p-6",
              "transition-all duration-300",
              "hover:scale-[1.02]",
              item.className,
              item.hoverColor
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="relative z-10 h-full text-left">
              <motion.div 
                className="flex items-center gap-2"
                variants={{
                  hover: {
                    x: 10,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }
                }}
              >
                <div className="rounded-lg p-2">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
              </motion.div>
              <motion.p 
                className="mt-2 text-sm text-muted-foreground"
                variants={{
                  hover: {
                    x: 10,
                    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
                  }
                }}
              >
                {item.description}
              </motion.p>
            </div>
          </motion.button>
        ))}
      </div>

      <Window 
        isOpen={!!activeWindow}
        onClose={() => setActiveWindow(null)}
        title={activeWindow?.title}
      >
        {activeWindow?.component}
      </Window>

      <ShortcutsModal 
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};

export default BentoGrid;