// src/components/statistics/statistics-cards.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Database } from 'lucide-react';
import { CsvManager } from './csv-manager';

export function StatisticsCards() {
  const [isTableOpen, setIsTableOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          onClick={() => setIsTableOpen(true)}
          className="cursor-pointer hover:border-primary transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Training Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage your AI training data records
            </p>
          </CardContent>
        </Card>
      </div>

      {isTableOpen && <CsvManager onClose={() => setIsTableOpen(false)} />}
    </>
  );
}