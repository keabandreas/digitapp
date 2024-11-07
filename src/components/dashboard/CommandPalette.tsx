// @/components/dashboard/CommandPalette.tsx
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from "@/lib/utils";
import { CommandItem } from './CommandItem';
import { CommandItem as CommandItemType } from '@/components/dashboard/types';
import searchConfig from '@/components/dashboard/searchConfig';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandSelect: (index: number) => void;
}

export const CommandPalette = ({ isOpen, onClose, onCommandSelect }: CommandPaletteProps) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentCommands, setRecentCommands] = useState<CommandItemType[]>(
    searchConfig.getRecentCommands()
  );

  // Initialize Fuse with config
  const fuse = useMemo(() => new Fuse(
    searchConfig.baseCommands.map(cmd => ({
      ...cmd,
      action: () => onCommandSelect(searchConfig.baseCommands.indexOf(cmd))
    })), 
    searchConfig.fuseOptions
  ), [onCommandSelect]);

  // Get filtered commands using config
  const filteredCommands = useMemo(() => {
    let commands = searchConfig.getFilteredCommands(
      searchConfig.baseCommands.map(cmd => ({
        ...cmd,
        action: () => onCommandSelect(searchConfig.baseCommands.indexOf(cmd))
      })),
      search,
      fuse
    );
    if (selectedCategory) {
      commands = commands.filter(cmd => cmd.category === selectedCategory);
    }
    return commands;
  }, [search, selectedCategory, fuse, onCommandSelect]);

  // Handle command execution
  const executeCommand = (command: CommandItemType) => {
    command.action();
    setRecentCommands(prev => {
      const newRecent = [command, ...prev.filter(cmd => cmd.id !== command.id)].slice(0, 5);
      searchConfig.saveRecentCommands(newRecent);
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
              <div className="flex items-center border-b border-[#4C566A] px-4 py-3">
                <Search className="w-5 h-5 text-[#D8DEE9]" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search commands, scripts, and functions..."
                  className="w-full bg-transparent border-none outline-none text-[#ECEFF4] placeholder-[#D8DEE9]/50 px-4"
                  autoFocus
                />
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {/* Recent commands */}
                {!search && recentCommands.length > 0 && (
                  <Command.Group heading="Recent">
                    {recentCommands.map((cmd) => (
                      <CommandItem key={cmd.id} command={cmd} onSelect={() => executeCommand(cmd)} />
                    ))}
                  </Command.Group>
                )}

                {/* Categories */}
                {!search && (
                  <Command.Group heading="Categories">
                    <div className="flex flex-wrap gap-2 p-4">
                      {searchConfig.categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm",
                            selectedCategory === category
                              ? "bg-[#88C0D0] text-[#2E3440]"
                              : "bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A]"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </Command.Group>
                )}

                {/* Filtered results */}
                {filteredCommands.length > 0 ? (
                  <Command.Group heading="Results">
                    {filteredCommands.map((cmd) => (
                      <CommandItem key={cmd.id} command={cmd} onSelect={() => executeCommand(cmd)} />
                    ))}
                  </Command.Group>
                ) : (
                  <div className="p-4 text-center text-sm text-[#D8DEE9]">
                    No results found.
                  </div>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;