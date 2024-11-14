// @/lib/hooks/useKeyboardShortcuts.ts
// Contains the hook
import { useHotkeys } from 'react-hotkeys-hook';
import { KeyboardShortcuts } from '@/lib/config/keyboardShortcuts';

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  Object.entries(shortcuts).forEach(([name, binding]) => {
    useHotkeys(binding.key, (e) => {
      e.preventDefault();
      binding.action();
    });
  });
};