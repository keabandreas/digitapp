// src/components/dashboard/CommandItem.tsx
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
  </Command.Item>
);

export default CommandItem;