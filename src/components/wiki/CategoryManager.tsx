// @/components/wiki/CategoryManager.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryWithHierarchy, Tag } from '@/lib/types/wiki';
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  categories: CategoryWithHierarchy[];
  onCategoryCreate: (name: string, parentId?: number) => Promise<void>;
  onCategoryUpdate: (id: number, name: string) => Promise<void>;
  onCategoryDelete: (id: number) => Promise<void>;
  onCategoryMove: (id: number, parentId: number | null) => Promise<void>;
  onCategoryReorder: (id: number, newOrder: number) => Promise<void>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  onCategoryMove,
  onCategoryReorder,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [draggedCategory, setDraggedCategory] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState<{ id: number; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, categoryId: number) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.setData('text/plain', categoryId.toString());
  };

  const handleDragOver = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (draggedCategory === categoryId) return;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    target.classList.remove('border-t-2', 'border-b-2');
    if (y < rect.height / 3) {
      target.classList.add('border-t-2');
    } else if (y > (rect.height * 2) / 3) {
      target.classList.add('border-b-2');
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedCategory) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < rect.height / 3) {
      // Drop above
      await onCategoryReorder(draggedCategory, targetId - 0.5);
    } else if (y > (rect.height * 2) / 3) {
      // Drop below
      await onCategoryReorder(draggedCategory, targetId + 0.5);
    } else {
      // Drop as child
      await onCategoryMove(draggedCategory, targetId);
    }

    setDraggedCategory(null);
    target.classList.remove('border-t-2', 'border-b-2');
  };

  const renderCategory = (category: CategoryWithHierarchy) => {
    const isExpanded = expandedCategories.has(category.id);
    
    return (
      <div key={category.id}>
        <div
          className={cn(
            "flex items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer",
            draggedCategory === category.id && "opacity-50"
          )}
          draggable
          onDragStart={(e) => handleDragStart(e, category.id)}
          onDragOver={(e) => handleDragOver(e, category.id)}
          onDrop={(e) => handleDrop(e, category.id)}
          style={{ marginLeft: `${category.level * 1.5}rem` }}
        >
          <button
            className="mr-2"
            onClick={() => toggleExpanded(category.id)}
          >
            {category.children.length > 0 && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>
          
          <GripVertical className="w-4 h-4 mr-2 cursor-grab" />
          
          <span className="flex-1">{category.name}</span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditCategory({ id: category.id, name: category.name });
              }}
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryDelete(category.id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
          >
            {category.children.map(renderCategory)}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Categories</h2>
        <Button onClick={() => setEditCategory({ id: -1, name: '' })}>
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-1">
        {categories.map(renderCategory)}
      </div>

      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory?.id === -1 ? 'Add Category' : 'Edit Category'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                value={editCategory?.name ?? ''}
                onChange={(e) => setEditCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Category name"
              />
            </div>

            {editCategory?.id === -1 && (
              <div>
                <select
                  value={selectedParentId?.toString() ?? ''}
                  onChange={(e) => setSelectedParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 rounded-md border"
                >
                  <option value="">No parent (root category)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.level)}{cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditCategory(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (editCategory) {
                    if (editCategory.id === -1) {
                      await onCategoryCreate(editCategory.name, selectedParentId ?? undefined);
                    } else {
                      await onCategoryUpdate(editCategory.id, editCategory.name);
                    }
                    setEditCategory(null);
                  }
                }}
              >
                {editCategory?.id === -1 ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;