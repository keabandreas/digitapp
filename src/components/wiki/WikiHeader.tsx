import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWiki } from '@/lib/context/WikiContext';

export function WikiHeader() {
  const { 
    isUnlocked,
    setIsUnlocked,
    setIsPasswordPromptOpen,
    setIsAddDocumentOpen,
    setIsUploadDialogOpen
  } = useWiki();

  const handleUnlockToggle = (checked: boolean) => {
    if (checked && !isUnlocked) {
      setIsPasswordPromptOpen(true);
    } else if (!checked && isUnlocked) {
      setIsUnlocked(false);
    }
  };

  const handleAddDocument = () => {
    if (!isUnlocked) {
      setIsPasswordPromptOpen(true);
    } else {
      setIsAddDocumentOpen(true);
    }
  };

  const handleUploadDocument = () => {
    if (!isUnlocked) {
      setIsPasswordPromptOpen(true);
    } else {
      setIsUploadDialogOpen(true);
    }
  };

  return (
    <div className="flex-shrink-0 p-4 bg-base-200 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Wiki Documents</h1>
          <p className="text-white/80">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted-foreground/60 text-sm">Ctrl + Space</kbd> to search
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={handleAddDocument}>
            Add New Page
          </Button>
          <Button variant="outline" onClick={handleUploadDocument}>
            Upload Word Document
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="lock-mode"
              checked={isUnlocked}
              onCheckedChange={handleUnlockToggle}
            />
            <Label htmlFor="lock-mode">
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}