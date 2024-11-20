// src/components/wiki/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { useWiki } from '@/lib/context/WikiContext';

interface FileUploadProps {
  onFileProcessed: (data: {
    title: string;
    content: string;
    category: string;
    restricted: boolean;
  }) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const { categories } = useWiki();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [restricted, setRestricted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      console.log('File details:', {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      });
      setFile(uploadedFile);
      setTitle(uploadedFile.name.replace(/\.[^/.]+$/, ""));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    noKeyboard: true
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    
    setIsProcessing(true);
    console.log('Starting file upload processing:', {
      fileName: file.name,
      fileSize: file.size,
      title,
      category
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending file to server...');
      const response = await fetch('/api/statistics/convert-docx', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Upload failed');
      }

      const data = await response.json();
      console.log('Server response:', {
        contentLength: data.content?.length,
        hasMessages: Boolean(data.messages),
        messageCount: data.messages?.length
      });

      // Validate the converted content
      if (!data.content || data.content.trim().length === 0) {
        throw new Error('Document conversion resulted in empty content');
      }

      // Process the document
      onFileProcessed({
        title,
        content: data.content,
        category,
        restricted
      });

      console.log('Document processed successfully');
      toast.success('File uploaded and converted successfully');
      
    } catch (error) {
      console.error('Upload/conversion error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>{file ? file.name : "Drag 'n' drop a Word file here, or click to select"}</p>
        )}
      </div>

      {file && (
        <>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {'  '.repeat(cat.level)}{cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="restricted"
              checked={restricted}
              onCheckedChange={setRestricted}
              disabled={isProcessing}
            />
            <Label htmlFor="restricted">Restricted</Label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Upload and Process'}
          </Button>
        </>
      )}
    </div>
  );
};