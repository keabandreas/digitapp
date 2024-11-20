// src/components/wiki/AddDocument.tsx
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
  onClose?: () => void;
}

export default function AddDocument({
  categories,
  tags,
  onCreateDocument,
  onClose
}: AddDocumentProps) {
  console.log('AddDocument render with categories:', categories);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [restricted, setRestricted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting document with category:', category);
    
    try {
      await onCreateDocument(title, category || "General", restricted, selectedTags);
      setTitle("");
      setCategory("");
      setRestricted(false);
      setSelectedTags([]);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating document:', error);
    }
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
        <Select 
          value={category} 
          onValueChange={(value) => {
            console.log('Category selected:', value);
            setCategory(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General">General</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
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
              onClick={() => {
                setSelectedTags(prev => 
                  prev.includes(tag.id)
                    ? prev.filter(id => id !== tag.id)
                    : [...prev, tag.id]
                );
              }}
            >
              {tag.name}
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