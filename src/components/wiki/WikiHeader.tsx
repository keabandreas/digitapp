// @/components/wiki/WikiHeader.tsx
// Manages the top navigation and controls
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WikiHeaderProps {
  isUnlocked: boolean;
  onUnlockToggle: (checked: boolean) => void;
  onAddDocument: () => void;
  onUploadDocument: () => void;
}

export const WikiHeader: React.FC<WikiHeaderProps> = ({
  isUnlocked,
  onUnlockToggle,
  onAddDocument,
  onUploadDocument
}) => (
  <div className="flex-shrink-0 p-4 bg-base-300 border-b">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Wiki Documents</h1>
      <p className="text-[#D8DEE9]/80 mt-2">
        Press <kbd className="px-1.5 py-0.5 rounded bg-[#4C566A] text-sm">Ctrl + Space</kbd> to open apps
      </p>
      <div className="flex items-center space-x-4">
        <Button onClick={onAddDocument}>Add New Page</Button>
        <Button variant="outline" onClick={onUploadDocument}>
          Upload Word Document
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id="lock-mode"
            checked={isUnlocked}
            onCheckedChange={onUnlockToggle}
          />
          <Label htmlFor="lock-mode">
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </Label>
        </div>
      </div>
    </div>
  </div>
);