import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  BarChart3, Database, BookOpen, Command, X, 
  Keyboard, Search, Settings, Plus, ChevronRight
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";

const HostApps = dynamic(() => import('@/pages/hostapps'));
const Statistics = dynamic(() => import('@/pages/statistics'));
const Wiki = dynamic(() => import('@/pages/wiki'));

// Nordic background with animated aurora effects
const NordicBackground = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-b from-[#2E3440] to-[#3B4252]">
      {/* Animated aurora layers */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_${50 + i * 20}%_${-20 + i * 10}%,#88C0D0,transparent_${40 + i * 10}%)]`} />
        </motion.div>
      ))}
    </div>
    
    {/* Floating particles */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#88C0D0]/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
    
    {/* Grid overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#434C5E_1px,transparent_1px),linear-gradient(to_bottom,#434C5E_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
  </>
);

// Window component for modal dialogs
const Window = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E3440]/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[90vw] h-[90vh]"
        >
          <Card className="relative w-full h-full bg-[#3B4252] rounded-xl shadow-xl flex flex-col border border-[#4C566A]">
            <div className="flex items-center justify-between p-4 border-b border-[#4C566A]">
              <h2 className="text-lg font-medium text-[#ECEFF4]">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#434C5E] transition-colors"
              >
                <X className="w-5 h-5 text-[#D8DEE9]" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto custom-scrollbar">
              {children}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced card with 3D tilt effect
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Keyboard shortcuts modal
const ShortcutsModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md p-6 bg-[#3B4252] rounded-xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#ECEFF4]">Keyboard Shortcuts</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#434C5E] transition-colors"
            >
              <X className="w-5 h-5 text-[#D8DEE9]" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { keys: ["Alt", "1-3"], description: "Open applications" },
              { keys: ["Ctrl", "Space"], description: "Open search" },
              { keys: ["?"], description: "Show shortcuts" },
              { keys: ["Esc"], description: "Close windows" },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shortcut.keys.map((key, j) => (
                    <kbd key={j} className="px-2 py-1 rounded bg-[#4C566A] text-[#ECEFF4] text-sm">
                      {key}
                    </kbd>
                  ))}
                </div>
                <span className="text-[#D8DEE9]">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Command palette
const CommandPalette = ({ isOpen, onClose, onCommandSelect }) => {
  const [search, setSearch] = useState("");
  
  const commands = [
    { name: "Open Host Applications", shortcut: "⌘ 1", action: () => onCommandSelect(0) },
    { name: "Open Statistics", shortcut: "⌘ 2", action: () => onCommandSelect(1) },
    { name: "Open Wiki", shortcut: "⌘ 3", action: () => onCommandSelect(2) },
    { name: "Show Keyboard Shortcuts", shortcut: "⌘ /" },
    { name: "Open Settings", shortcut: "⌘ ," },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-[#3B4252] rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#4C566A]">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#D8DEE9]" />
                <input
                  type="text"
                  placeholder="Search commands..."
                  className="w-full bg-transparent border-none outline-none text-[#ECEFF4] placeholder-[#D8DEE9]/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCommands.map((cmd, i) => (
                <motion.button
                  key={i}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#434C5E] text-left"
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    if (cmd.action) {
                      cmd.action();
                      onClose();
                    }
                  }}
                >
                  <span className="text-[#ECEFF4]">{cmd.name}</span>
                  <kbd className="px-2 py-1 rounded bg-[#4C566A] text-[#D8DEE9] text-sm">
                    {cmd.shortcut}
                  </kbd>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// BentoGrid component
const BentoGrid = () => {
  const [activeWindow, setActiveWindow] = useState(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const items = [
    {
      title: "Host Applications",
      description: "Manage and monitor your host applications",
      icon: <Database className="w-6 h-6 text-[#88C0D0]" />, // Frost 1
      className: "md:col-span-2",
      component: <HostApps />,
      hoverColor: "hover:bg-[#88C0D0]/20"
    },
    {
      title: "Statistics",
      description: "View system statistics and analytics",
      icon: <BarChart3 className="w-6 h-6 text-[#81A1C1]" />, // Frost 2
      className: "row-span-2",
      component: <Statistics />,
      hoverColor: "hover:bg-[#81A1C1]/20"
    },
    {
      title: "Wiki",
      description: "Access documentation and guides",
      icon: <BookOpen className="w-6 h-6 text-[#5E81AC]" />, // Frost 3
      className: "md:col-span-2",
      component: <Wiki />,
      hoverColor: "hover:bg-[#5E81AC]/20"
    }
  ];


  useEffect(() => {
    const handleKeyboard = (e) => {
      // Alt + number for applications
      if (e.altKey && !isNaN(e.key)) {
        e.preventDefault(); // Prevent any default browser behavior
        const num = parseInt(e.key);
        if (num > 0 && num <= items.length) {
          setActiveWindow(items[num - 1]);
        }
      }
      
      // Space bar for command palette
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // ? for shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }

      // Escape to close windows
      if (e.key === 'Escape') {
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (activeWindow) setActiveWindow(null);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [items, isShortcutsOpen, isCommandPaletteOpen, activeWindow]);

  return (
    <>
      <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {items.map((item, i) => (
          <motion.button 
            key={i}
            onClick={() => setActiveWindow(item)}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-[#4C566A]",
              "bg-[#3B4252]/80 backdrop-blur-sm p-4 hover:border-[#88C0D0]",
              "transition-colors duration-200",
              item.className,
              item.hoverColor
            )}
            whileHover="hover"
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
                <h3 className="font-semibold text-[#ECEFF4]">{item.title}</h3>
              </motion.div>
              <motion.p 
                className="mt-2 text-sm text-[#D8DEE9]/80"
                variants={{
                  hover: {
                    x: 10,
                    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
                  }
                }}
              >
                {item.description}
              </motion.p>

              {/* Command hint */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-[#D8DEE9]/50">
                <Command className="w-3 h-3" />
                <span>{i + 1}</span>
              </div>
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

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCommandSelect={(index) => {
          setActiveWindow(items[index]);
        }}
      />
    </>
  );
};

export default function Dashboard() {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  return (
    <>
      <Head>
        <title>DigitAPP</title>
        <meta name="description" content="Modern dashboard interface" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="relative min-h-screen w-full overflow-hidden">
        <NordicBackground />
        
        <div className="relative w-full p-6">
          <div className="max-w-6xl mx-auto mt-16">
          <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#ECEFF4]">Dashboard</h1>
          <p className="text-[#D8DEE9]/80 mt-2">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#4C566A] text-sm">Ctrl + Space</kbd> to search or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[#4C566A] text-sm">?</kbd> for shortcuts
          </p>
        </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-[#434C5E] transition-colors"
                onClick={() => setIsShortcutsOpen(true)}
              >
                <Keyboard className="w-5 h-5 text-[#D8DEE9]" />
              </motion.button>
            </div>
            <BentoGrid />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #3B4252;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4C566A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #81A1C1;
        }
      `}</style>
    </>
  );
}