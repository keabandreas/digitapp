"use client"

import React, { ReactNode } from 'react';
import { TracingBeam } from "@/components/ui/tracing-beam";

interface ScrollableContentProps {
  children: ReactNode;
}

export const ScrollableContent: React.FC<ScrollableContentProps> = ({ children }) => {
  return (
    <div className="flex-1 relative">
      <TracingBeam className="absolute inset-0">
        <div className="h-full overflow-y-scroll scrollbar-hide">
          <div className="min-h-screen bg-gray-100">
            {children}
          </div>
        </div>
      </TracingBeam>
    </div>
  );
};