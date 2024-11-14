export const KeyboardShortcutsHelp = ({ shortcuts }: { shortcuts: KeyboardShortcuts }) => {
    const groupedShortcuts = Object.values(shortcuts).reduce((acc, shortcut) => {
      if (!acc[shortcut.group]) {
        acc[shortcut.group] = [];
      }
      acc[shortcut.group].push(shortcut);
      return acc;
    }, {} as Record<string, KeyBinding[]>);
  
    return (
      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([group, bindings]) => (
          <div key={group}>
            <h3 className="text-lg font-medium mb-2">{group}</h3>
            <div className="space-y-2">
              {bindings.map((binding) => (
                <div key={binding.key} className="flex justify-between">
                  <span>{binding.description}</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm">
                    {binding.key.split('+').map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' + ')}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };