import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { IconTrash, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import { CsvForm } from '@/components/ui/csv-form';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CsvRow {
  [key: string]: string;
}

interface CsvManagerProps {
  onClose: () => void;
}

const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    const rows = data.split('\n').filter(row => row.trim() !== '').map(row => row.split(','));
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj: CsvRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error('Fetcher error:', error);
    throw error;
  }
};

export function CsvManager({ onClose }: CsvManagerProps) {
  const { data: csvData, error, mutate } = useSWR('/api/statistics/keab-training-data', fetcher);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingData, setEditingData] = useState<CsvRow | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);

  const handleAddClick = useCallback(() => {
    if (csvData && csvData.length > 0) {
      const headers = Object.keys(csvData[0]);
      const initialData = Object.fromEntries(headers.map(header => [header, '']));
      setEditingData(initialData);
      setFormMode('add');
      setIsFormOpen(true);
    }
  }, [csvData]);

  const handleEditClick = useCallback((row: CsvRow) => {
    setEditingData(row);
    setFormMode('edit');
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = (index: number) => {
    setRowToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (rowToDelete === null) return;
    
    try {
      setDeletingRow(rowToDelete);
      const response = await fetch('/api/statistics/remove-csv-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: rowToDelete + 1 }),
      });

      if (!response.ok) throw new Error(await response.text());

      await mutate();
      toast.success('Entry removed successfully');
    } catch (error) {
      console.error('Error removing row:', error);
      toast.error('Failed to remove entry');
    } finally {
      setDeletingRow(null);
      setRowToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, string>) => {
    try {
      if (formMode === 'add') {
        const rowWithTime = {
          ...formData,
          Time: new Date().toLocaleString('en-GB')
        };

        const response = await fetch('/api/statistics/add-csv-row', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rowWithTime),
        });

        if (!response.ok) throw new Error(await response.text());
      } else {
        const response = await fetch('/api/statistics/edit-csv-row', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            index: csvData?.findIndex(row =>
              Object.entries(row).every(([key, value]) => editingData?.[key] === value)
            ),
            data: formData,
          }),
        });

        if (!response.ok) throw new Error(await response.text());
      }

      await mutate();
      setIsFormOpen(false);
      setEditingData(undefined);
      toast.success(formMode === 'add' ? 'Entry added successfully' : 'Entry updated successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error(`Failed to ${formMode} entry`);
    }
  };

  if (error) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="text-destructive">Failed to load data</div>
    </div>
  );
  
  if (!csvData) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[22px] blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/50 rounded-[22px]" />
          
          {/* Content */}
          <div className="relative bg-card text-card-foreground rounded-[22px] shadow-2xl border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white/90">
                  Training Data Management
                </h1>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <IconX className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="bg-background rounded-lg shadow-sm overflow-hidden">
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(csvData[0]).map(header => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.map((row, index) => (
                        <TableRow 
                          key={index} 
                          className="hover:bg-muted/50 transition-none"
                          style={{ willChange: 'background-color' }}
                        >
                          {Object.values(row).map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue hover:text-blue hover:bg-white/10 transition-colors"
                                onClick={() => handleEditClick(row)}
                              >
                                <IconPencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red hover:text-red hover:bg-white/10 transition-colors"
                                onClick={() => handleDeleteClick(index)}
                                disabled={deletingRow === index}
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow 
                        className="hover:bg-muted/50 transition-none"
                        style={{ willChange: 'background-color' }}
                      >
                        <TableCell colSpan={Object.keys(csvData[0]).length + 1}>
                          <div className="flex justify-end p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green hover:text-success hover:bg-white/10 transition-colors"
                              onClick={handleAddClick}
                            >
                              <IconPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CsvForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingData(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingData}
        mode={formMode}
      />
    </div>
  );
}