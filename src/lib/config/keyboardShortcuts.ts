// @/lib/config/keyboardShortcuts.ts
export interface KeyBinding {
    key: string;
    description: string;
    group: string;
    action: () => void;
  }
  
  export interface KeyboardShortcuts {
    [key: string]: KeyBinding;
  }
  
  export const createKeyboardShortcuts = (actions: {
    onNewDocument: () => void;
    onToggleCategory: () => void;
    onEditDocument: () => void;
    onSearch: () => void;
    onToggleLock: () => void;
    onSave: () => void;
    onCancel: () => void;
  }): KeyboardShortcuts => ({
    newDocument: {
      key: 'shift+n',
      description: 'Create new document',
      group: 'Documents',
      action: actions.onNewDocument
    },
    toggleCategory: {
      key: 'shift+/',
      description: 'Toggle category expansion',
      group: 'Navigation',
      action: actions.onToggleCategory
    },
    editDocument: {
      key: 'shift+e',
      description: 'Edit current document',
      group: 'Documents',
      action: actions.onEditDocument
    },
    search: {
      key: 'ctrl+space',
      description: 'Open search',
      group: 'Navigation',
      action: actions.onSearch
    },
    toggleLock: {
      key: 'shift+l',
      description: 'Toggle document lock',
      group: 'Security',
      action: actions.onToggleLock
    },
    save: {
      key: 'ctrl+s',
      description: 'Save document',
      group: 'Documents',
      action: actions.onSave
    },
    cancel: {
      key: 'escape',
      description: 'Cancel current action',
      group: 'General',
      action: actions.onCancel
    }
  });