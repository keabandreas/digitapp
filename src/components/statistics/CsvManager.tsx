import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollableContent } from '@/components/ui/ScrollableContent';

interface CsvRow {
  [key: string]: string;
}

interface CsvTableProps {
  data: CsvRow[];
  selectedRow: number | null;
  onRowSelect: (index: number) => void;
}

const CsvTable: React.FC<CsvTableProps> = React.memo(({ data, selectedRow, onRowSelect }) => (
  <ScrollableContent className="h-[300px] w-full rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {data[0] && Object.keys(data[0]).map(header => (
            <TableHead key={header} className="px-4 py-2 whitespace-nowrap">{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow
            key={index}
            className={`cursor-pointer ${selectedRow === index ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => onRowSelect(index)}
          >
            {Object.values(row).map((value, cellIndex) => (
              <TableCell key={cellIndex} className="px-4 py-2 whitespace-nowrap">{value}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </ScrollableContent>
));

interface CsvManagerProps {
  mode?: 'view' | 'add' | 'remove';
  onComplete?: () => void;
  onCancel?: () => void;
}

const CsvManager: React.FC<CsvManagerProps> = ({ mode = 'view', onComplete, onCancel }) => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [newRow, setNewRow] = useState<CsvRow>({});
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchCsvData();
  }, []);

  const fetchCsvData = useCallback(async () => {
    try {
      const response = await fetch('/api/keab-training-data');
      const text = await response.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj: CsvRow = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      setCsvData(data);
      setNewRow(Object.fromEntries(headers.filter(header => header !== 'timestamp').map(header => [header, ''])));
    } catch (error) {
      console.error('Error fetching CSV data:', error);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, header: string) => {
    setNewRow(prev => ({ ...prev, [header]: e.target.value }));
  }, []);

  const addRow = useCallback(async () => {
    try {
      const response = await fetch('/api/add-csv-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow),
      });
      if (response.ok) {
        await fetchCsvData();
        setNewRow(Object.fromEntries(Object.keys(newRow).map(key => [key, ''])));
        if (onComplete) onComplete();
      } else {
        console.error('Failed to add row');
      }
    } catch (error) {
      console.error('Error adding row:', error);
    }
  }, [newRow, fetchCsvData, onComplete]);

  const removeRow = useCallback(async () => {
    if (selectedRow === null) return;

    try {
      const response = await fetch('/api/remove-csv-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: selectedRow + 1 }),
      });
      if (response.ok) {
        await fetchCsvData();
        setSelectedRow(null);
        if (onComplete) onComplete();
      } else {
        console.error('Failed to remove row');
      }
    } catch (error) {
      console.error('Error removing row:', error);
    }
  }, [selectedRow, fetchCsvData, onComplete]);

  const isNewRowValid = useMemo(() => {
    return Object.values(newRow).every(value => value.trim() !== '');
  }, [newRow]);

  if (mode === 'add') {
    return (
      <div className="space-y-4">
        {Object.keys(newRow).map(header => (
          <Input
            key={header}
            placeholder={header}
            value={newRow[header]}
            onChange={(e) => handleInputChange(e, header)}
          />
        ))}
        <div className="flex justify-between">
          <Button onClick={addRow} disabled={!isNewRowValid}>Add Row</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (mode === 'remove') {
    return (
      <div className="space-y-4">
        <CsvTable data={csvData} selectedRow={selectedRow} onRowSelect={setSelectedRow} />
        <div className="flex justify-between mt-4">
          <Button onClick={removeRow} disabled={selectedRow === null}>Remove Selected Row</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  // Default view mode
  return <CsvTable data={csvData} selectedRow={null} onRowSelect={() => {}} />;
};

export default CsvManager;
