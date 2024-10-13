"use client";

import React from "react";

export const AuroraBackground = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`aurora-background min-h-screen w-full ${className}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blur absolute -inset-[10px]"></div>
      </div>
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export const AuroraBackgroundBorder = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`aurora-background-border relative ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="aurora-blur absolute -inset-[10px]"></div>
      </div>
      <div className="relative bg-gray-900/50 backdrop-blur-xl h-full w-full rounded-lg">
        {children}
      </div>
    </div>
  );
};

export const AuroraBackgroundIcon = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`aurora-background-icon relative ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="aurora-blur absolute -inset-[10px]"></div>
      </div>
      <div className="relative h-full w-full rounded-lg">
        {children}
      </div>
    </div>
  );
};
