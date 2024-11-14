// src/components/wiki/WikiHeader.tsx
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWiki } from '@/lib/context/WikiContext';

export const WikiHeader = () => {
  const { 
    isUnlocked,
    setIsUnlocked,
    setIsPasswordPromptOpen,
    isLoading 
  } = useWiki();

  const handleUnlockToggle = (checked: boolean) => {
    if (checked && !isUnlocked) {
      setIsPasswordPromptOpen(true);
    } else if (!checked && isUnlocked) {
      setIsUnlocked(false);
    }
  };

  return (
    <div className="flex-shrink-0 p-4 bg-base-300 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Wiki Documents</h1>
          <p className="text-[#D8DEE9]/80">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#4C566A] text-sm">Ctrl + Space</kbd> to open apps
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsPasswordPromptOpen(true)}>Add New Page</Button>
          <Button variant="outline" onClick={() => setIsPasswordPromptOpen(true)}>
            Upload Word Document
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="lock-mode"
              checked={isUnlocked}
              onCheckedChange={handleUnlockToggle}
              disabled={isLoading}
            />
            <Label htmlFor="lock-mode">
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};