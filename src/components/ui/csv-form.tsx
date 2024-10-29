"use client";
import React, { useEffect, useState } from 'react';
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";

interface CsvFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  initialData?: Record<string, string>;
  mode: 'add' | 'edit';
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export function CsvForm({ isOpen, onClose, onSubmit, initialData = {}, mode }: CsvFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="container relative z-10 mx-auto flex min-h-screen items-center justify-center">
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                {mode === 'add' ? 'Add New Entry' : 'Edit Entry'}
              </h2>
              <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
              </p>
            <div className="mt-8">
            </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <IconX className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
          </div>
          <form className="my-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {Object.keys(formData).map(field => (
                field !== 'Time' && (
                  <LabelInputContainer key={field}>
                    <Label htmlFor={field}>{field}</Label>
                    <Input
                      id={field}
                      placeholder={field}
                      value={formData[field]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [field]: e.target.value
                      }))}
                      type="text"
                    />
                  </LabelInputContainer>
                )
              ))}
            </div>

            <div className="mt-8">
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit"
              >
                {mode === 'add' ? 'Add Entry' : 'Save Changes'} →
                <BottomGradient />
              </button>

              <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

              <button
                type="button"
                onClick={onClose}
                className="relative group/btn flex items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              >
                <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                  Cancel
                </span>
                <BottomGradient />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
