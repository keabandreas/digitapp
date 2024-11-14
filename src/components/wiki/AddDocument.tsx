// @/components/wiki/AddDocument.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Category, Tag } from '@/lib/types/wiki';
import { X } from 'lucide-react';

interface AddDocumentProps {
  categories: Category[];
  tags: Tag[];
  onCreateDocument: (
    title: string,
    category: string,
    restricted: boolean,
    tagIds: number[],
    content?: string
  ) => Promise<void>;
  initialCategory?: string;
  onClose?: () => void;
}

export default function AddDocument({
  categories,
  tags,
  onCreateDocument,
  initialCategory = "",
  onClose
}: AddDocumentProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [restricted, setRestricted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateDocument(title, category, restricted, selectedTags);
    setTitle("");
    setCategory("");
    setRestricted(false);
    setSelectedTags([]);
    if (onClose) onClose();
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {'  '.repeat(cat.level)}{cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              style={{
                backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : 'transparent',
                borderColor: tag.color,
                color: selectedTags.includes(tag.id) ? tag.color : 'inherit'
              }}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {selectedTags.includes(tag.id) && (
                <X className="w-3 h-3 ml-1" onClick={(e) => {
                  e.stopPropagation();
                  toggleTag(tag.id);
                }} />
              )}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="restricted"
          checked={restricted}
          onCheckedChange={setRestricted}
        />
        <Label htmlFor="restricted">Restricted</Label>
      </div>

      <Button type="submit">Create Document</Button>
    </form>
  );
}