// src/components/dashboard/CommandPalette.tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command } from 'cmdk';
import { CommandItem } from './CommandItem';
import { CommandItem as CommandItemType } from '@/components/dashboard/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandSelect: (index: number) => void;
}

export const CommandPalette = ({ isOpen, onClose, onCommandSelect }: CommandPaletteProps) => {
  const [recentCommands, setRecentCommands] = useState<CommandItemType[]>([]);

  // Base commands for navigation
  const baseCommands = [
    {
      id: 'host-apps',
      name: "Host Applications",
      description: "Manage and monitor your host applications",
      shortcut: "Alt + 1",
      category: 'navigation',
      action: () => onCommandSelect(0)
    },
    {
      id: 'statistics',
      name: "Statistics",
      description: "View system statistics and analytics",
      shortcut: "Alt + 2",
      category: 'navigation',
      action: () => onCommandSelect(1)
    },
    {
      id: 'wiki',
      name: "Documentation",
      description: "Access guides and documentation",
      shortcut: "Alt + 3",
      category: 'navigation',
      action: () => onCommandSelect(2)
    }
  ];

  // Execute command and update recent commands
  const executeCommand = (command: CommandItemType) => {
    command.action();
    setRecentCommands(prev => {
      const newRecent = [command, ...prev.filter(cmd => cmd.id !== command.id)].slice(0, 5);
      return newRecent;
    });
    onClose();
  };

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
            className="w-full max-w-2xl overflow-hidden rounded-xl border bg-[#3B4252] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command>
              <Command.List className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {recentCommands.length > 0 && (
                  <Command.Group heading="Recent">
                    {recentCommands.map((cmd) => (
                      <CommandItem key={cmd.id} command={cmd} onSelect={() => executeCommand(cmd)} />
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Navigation">
                  {baseCommands.map((cmd) => (
                    <CommandItem key={cmd.id} command={cmd} onSelect={() => executeCommand(cmd)} />
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;