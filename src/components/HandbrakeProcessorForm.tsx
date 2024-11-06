import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface HandbrakeProcessorFormProps {
  password: string;
  onProcessingComplete: () => void;
}

const formSchema = z.object({
  file: z.string().min(1, "Please select a file"),
  preset: z.string().min(1, "Please select a preset")
})

type FormValues = z.infer<typeof formSchema>

export default function HandbrakeProcessorForm({ password, onProcessingComplete }: HandbrakeProcessorFormProps) {
  const [files, setFiles] = useState<string[]>([])
  const [presets, setPresets] = useState<Array<{ name: string; path: string | null }>>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: "",
      preset: "0"
    }
  })

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/handbrake?action=list_files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }
      
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch files");
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/handbrake?action=list_presets')
      const data = await response.json()
      if (data.presets) {
        setPresets(data.presets)
      }
    } catch (error) {
      toast.error("Failed to fetch presets")
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchFiles();
    fetchPresets();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    setIsUploading(true)
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const response = await fetch('/api/handbrake?action=upload_file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("File uploaded successfully");
        // Refresh the file list
        await fetchFiles();
        // Set the uploaded file as the selected file
        form.setValue('file', file.name);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/handbrake?action=process_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: values.file,
          preset_index: parseInt(values.preset),
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("File processed successfully");
        onProcessingComplete();
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Upload New File</Label>
          <Input 
            type="file" 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select File to Process</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {files.map((file) => (
                      <SelectItem key={file} value={file}>
                        {file}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Preset</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isProcessing || !form.formState.isValid}
        >
          {isProcessing ? "Processing..." : "Convert Video"}
        </Button>
      </form>
    </Form>
  );
}
