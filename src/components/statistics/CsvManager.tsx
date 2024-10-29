import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { IconTrash, IconPencil, IconPlus } from '@tabler/icons-react';
import { CsvForm } from '@/components/ui/csv-form';

interface CsvRow {
  [key: string]: string;
}

interface CsvTableProps {
  data: CsvRow[];
  onDeleteRow: (index: number) => Promise<void>;
  onEditClick: (row: CsvRow) => void;
  onAddClick: () => void;
  isDeleting: number | null;
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

const CsvTable: React.FC<CsvTableProps> = React.memo(({ 
  data, 
  onDeleteRow, 
  onEditClick,
  onAddClick,
  isDeleting
}) => {
  const headers = data[0] ? Object.keys(data[0]) : [];

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(header => (
              <TableHead key={header} className="px-4 py-2 whitespace-nowrap">{header}</TableHead>
            ))}
            <TableHead className="px-4 py-2 whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="hover:bg-gray-100">
              {headers.map(header => (
                <TableCell key={header} className="px-4 py-2 whitespace-nowrap">
                  {row[header]}
                </TableCell>
              ))}
              <TableCell className="px-4 py-2 whitespace-nowrap">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                    onClick={() => onEditClick(row)}
                  >
                    <IconPencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => onDeleteRow(index)}
                    disabled={isDeleting === index}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="hover:bg-gray-50">
            <TableCell colSpan={headers.length + 1} className="px-4 py-2 text-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-100"
                onClick={onAddClick}
              >
                <IconPlus className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
});

const formatCurrentTime = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB');
  const date = now.toLocaleDateString('en-GB');
  return `${time} ${date}`;
};

interface CsvManagerProps {
  mode?: 'view' | 'add' | 'remove';
  onComplete?: () => void;
  onCancel?: () => void;
}

const CsvManager: React.FC<CsvManagerProps> = () => {
  const { data: csvData, error, mutate } = useSWR('/api/keab-training-data', fetcher);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingData, setEditingData] = useState<CsvRow | undefined>();

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

  const handleFormSubmit = async (formData: Record<string, string>) => {
    try {
      if (formMode === 'add') {
        const rowWithTime = {
          ...formData,
          Time: formatCurrentTime()
        };

        const response = await fetch('/api/add-csv-row', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rowWithTime),
        });

        if (!response.ok) throw new Error(await response.text());
      } else {
        const response = await fetch('/api/edit-csv-row', {
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

  const removeRow = async (index: number) => {
    setDeletingRow(index);
    try {
      const response = await fetch('/api/remove-csv-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: index + 1 }),
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      await mutate();
      toast.success('Entry removed successfully');
    } catch (error) {
      console.error('Error removing row:', error);
      toast.error('Failed to remove entry');
    } finally {
      setDeletingRow(null);
    }
  };

  if (error) return <div>Failed to load data</div>;
  if (!csvData) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <CsvTable 
        data={csvData}
        onDeleteRow={removeRow}
        onEditClick={handleEditClick}
        onAddClick={handleAddClick}
        isDeleting={deletingRow}
      />

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
};

export default CsvManager;
