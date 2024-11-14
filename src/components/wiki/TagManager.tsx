// @/components/wiki/TagManager.tsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag } from '@/lib/types/wiki';

interface TagManagerProps {
  tags: Tag[];
  onTagCreate: (name: string, color: string) => Promise<void>;
  onTagDelete: (id: number) => Promise<void>;
  onTagsChange: (documentId: number, tagIds: number[]) => Promise<void>;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onTagCreate,
  onTagDelete,
  onTagsChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });

  const handleCreateTag = async () => {
    await onTagCreate(newTag.name, newTag.color);
    setNewTag({ name: '', color: '#3B82F6' });
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Tags</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Tag
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => onTagDelete(tag.id)}
              className="hover:opacity-75"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                value={newTag.name}
                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tag name"
              />
            </div>

            <div>
              <input
                type="color"
                value={newTag.color}
                onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 p-1 rounded border"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTag}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagManager;