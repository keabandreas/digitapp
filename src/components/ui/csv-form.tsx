import React from 'react';
import { Label } from "./label";
import { Input } from "./input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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
  const [formData, setFormData] = React.useState<Record<string, string>>(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            {mode === 'add' ? 'Add New Entry' : 'Edit Entry'}
          </DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <IconX className="h-5 w-5 text-muted-foreground" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="bg-background border-border"
                />
              </LabelInputContainer>
            )
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="relative group/btn"
            >
              Cancel
              <BottomGradient />
            </Button>
            <Button
              type="submit"
              className="relative group/btn bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {mode === 'add' ? 'Add Entry' : 'Save Changes'}
              <BottomGradient />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}