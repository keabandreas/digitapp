"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { IconDatabase } from "@tabler/icons-react";
import { useRouter } from 'next/router';

export function CsvStatisticsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full p-4 md:p-8 gap-4">
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        Statistics Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => router.push('/statistics/csv')} 
          className="cursor-pointer"
        >
          <BackgroundGradient className="rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 bg-blue-500/10 dark:bg-blue/20 rounded-full">
                <IconDatabase className="w-8 h-8 text-blue" />
              </div>
              <h2 className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 font-medium">
                Training Data Management
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                View and manage your AI training data records. Add, edit, or remove entries from your dataset.
              </p>
              <div className="mt-4 w-full">
                <button 
                  className="rounded-full w-full pl-4 pr-1 py-1 text-white flex items-center justify-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/statistics/csv');
                  }}
                >
                  <span>Open Manager</span>
                  <span className="bg-zinc-700 rounded-full px-2 py-0 text-white">→</span>
                </button>
              </div>
            </div>
          </BackgroundGradient>
        </div>
      </div>
    </div>
  );
}
