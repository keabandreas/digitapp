// @/components/dashboard/Window.tsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface WindowProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Window = ({ isOpen, onClose, children, title }: WindowProps) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
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

export default Window;