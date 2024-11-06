import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart3, Database, BookOpen } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { cn } from "@/lib/utils";

const HostApps = dynamic(() => import('@/pages/hostapps'));
const Statistics = dynamic(() => import('@/pages/statistics'));
const Wiki = dynamic(() => import('@/pages/wiki'));

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
          <Card className="relative w-full h-full bg-base-300 rounded-xl shadow-xl flex flex-col">
            <div 
              className="flex-1 p-4 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {children}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BentoGrid = () => {
  const [activeWindow, setActiveWindow] = useState(null);

  const items = [
    {
      title: "Host Applications",
      description: "Manage and monitor your host applications",
      icon: <Database className="w-6 h-6" />,
      className: "md:col-span-2",
      component: <HostApps />,
      hoverColor: "hover:bg-blue/90" // Different hover color for each card
    },
    {
      title: "Statistics",
      description: "View system statistics and analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      className: "row-span-2",
      component: <Statistics />,
      hoverColor: "hover:bg-purple/90"
    },
    {
      title: "Wiki",
      description: "Access documentation and guides",
      icon: <BookOpen className="w-6 h-6" />,
      className: "md:col-span-2",
      component: <Wiki />,
      hoverColor: "hover:bg-green/90"
    }
  ];

  return (
    <>
      <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {items.map((item, i) => (
          <motion.button 
            key={i}
            onClick={() => setActiveWindow(item)}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-base-300",
              "bg-base-200/80 backdrop-blur-sm p-4 hover:border-base-300",
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
                <h3 className="font-semibold">{item.title}</h3>
              </motion.div>
              <motion.p 
                className="mt-2 text-sm opacity-90"
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
    </>
  );
};

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>DigitAPP</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="relative min-h-screen w-full bg-black overflow-hidden">
        <StarsBackground 
          className="absolute top-0 left-0 w-full h-full"
          starCount={1000}
          starColor="white"
          size={1}
          fallSpeed={20}
        />
        <ShootingStars 
          className="absolute top-0 left-0 w-full h-full"
          starCount={10}
          starColor="white"
          speedFactor={0.5}
        />
        
        <div className="relative w-full p-6">
          <div className="max-w-6xl mx-auto mt-16">
            <h1 className="text-3xl font-bold mb-8 text-white"></h1>
            <BentoGrid />
          </div>
        </div>
      </div>
    </>
  );
}