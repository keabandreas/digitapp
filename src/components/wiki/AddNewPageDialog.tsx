import React, { useState } from 'react';
import { useWikiContext } from './WikiContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { wikiConfig } from './WikiConfig';

interface AddNewPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddNewPageDialog: React.FC<AddNewPageDialogProps> = ({ isOpen, onClose }) => {
  const { handleAddPage } = useWikiContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setExcerpt('');
    setCategory('');
    setSubCategory('');
    setIsRestricted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = {
      title,
      content,
      excerpt,
      category,
      subCategory,
      isRestricted,
      restrictedSections: [], // Add this line to include the restrictedSections property
    };
    handleAddPage(newPage);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Wiki Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <Textarea
            placeholder="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {wikiConfig.categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subCategory} onValueChange={setSubCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {wikiConfig.subCategories.map((subCat) => (
                <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch
              id="restricted"
              checked={isRestricted}
              onCheckedChange={setIsRestricted}
            />
            <label htmlFor="restricted">Restricted</label>
          </div>
          <Button type="submit">Add Page</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
