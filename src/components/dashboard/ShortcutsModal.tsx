// @/components/dashboard/ShortcutsModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal = ({ isOpen, onClose }: ShortcutsModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md p-6 bg-base-200 rounded-xl shadow-xl"
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

export default ShortcutsModal;