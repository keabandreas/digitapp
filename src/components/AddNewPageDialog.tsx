import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WikiPage } from '@/pages/wiki';

interface AddNewPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPage: (newPage: Omit<WikiPage, 'id'>) => void;
  categories: string[];
  subCategories: string[];
}

export const AddNewPageDialog: React.FC<AddNewPageDialogProps> = ({
  isOpen,
  onClose,
  onAddPage,
  categories,
  subCategories,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage: Omit<WikiPage, 'id'> = {
      title,
      content,
      excerpt: content.slice(0, 100) + '...',
      category,
      subCategory,
      restricted: isRestricted,
    };
    onAddPage(newPage);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setSubCategory('');
    setIsRestricted(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subCategory">Sub-Category</Label>
            <Select value={subCategory} onValueChange={setSubCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a sub-category" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((subCat) => (
                  <SelectItem key={subCat} value={subCat}>
                    {subCat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="restricted"
              checked={isRestricted}
              onChange={(e) => setIsRestricted(e.target.checked)}
            />
            <Label htmlFor="restricted">Restricted</Label>
          </div>
          <Button type="submit">Add Page</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
