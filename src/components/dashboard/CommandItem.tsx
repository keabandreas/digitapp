// @/components/dashboard/CommandItem.tsx
import { Command } from 'cmdk';
import { FileCode, Library, Tags } from 'lucide-react';
import { CommandItem as CommandItemType } from '@/components/dashboard/types';

interface CommandItemProps {
  command: CommandItemType;
  onSelect: () => void;
}

export const CommandItem = ({ command, onSelect }: CommandItemProps) => (
  <Command.Item
    value={command.name}
    onSelect={onSelect}
    className="flex flex-col px-4 py-2 hover:bg-[#434C5E] aria-selected:bg-[#434C5E]"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {command.category === 'scripts' && <FileCode className="h-4 w-4 text-[#D8DEE9]" />}
        {command.category === 'functions' && <Library className="h-4 w-4 text-[#D8DEE9]" />}
        <span className="font-medium text-[#ECEFF4]">{command.name}</span>
      </div>
      {command.shortcut && (
        <kbd className="px-2 py-1 rounded bg-[#4C566A] text-[#D8DEE9] text-xs">
          {command.shortcut}
        </kbd>
      )}
    </div>
    {command.description && (
      <p className="text-sm text-[#D8DEE9]/70 mt-1">{command.description}</p>
    )}
    {(command.module || command.path) && (
      <div className="flex items-center gap-2 mt-1 text-xs text-[#D8DEE9]/70">
        {command.module && (
          <span className="flex items-center gap-1">
            <Library className="h-3 w-3" />
            {command.module}
          </span>
        )}
        {command.path && (
          <span className="flex items-center gap-1">
            <FileCode className="h-3 w-3" />
            {command.path}
          </span>
        )}
      </div>
    )}
    {command.tags && (
      <div className="flex items-center gap-1 mt-1">
        <Tags className="h-3 w-3 text-[#D8DEE9]/70" />
        {command.tags.map(tag => (
          <span key={tag} className="text-xs text-[#D8DEE9]/70">
            #{tag}
          </span>
        ))}
      </div>
    )}
  </Command.Item>
);

export default CommandItem;