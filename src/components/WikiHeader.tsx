import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface WikiHeaderProps {
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
}

export const WikiHeader: React.FC<WikiHeaderProps> = ({ isLocked, setIsLocked }) => {
  const handleLockToggle = async () => {
    if (isLocked) {
      const enteredPassword = prompt('Enter password to unlock:');
      if (enteredPassword) {
        try {
          const response = await fetch('/api/verify-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: enteredPassword }),
          });

          if (response.ok) {
            setIsLocked(false);
          } else {
            const errorData = await response.json();
            alert(errorData.message || 'Incorrect password');
          }
        } catch (error) {
          console.error('Error verifying password:', error);
          alert('An error occurred while verifying the password');
        }
      }
    } else {
      setIsLocked(true);
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">Company Wiki</h1>
      <div className="flex items-center space-x-2">
        <span>{isLocked ? <Lock className="text-red-500" /> : <Unlock className="text-green-500" />}</span>
        <Switch checked={!isLocked} onCheckedChange={handleLockToggle} />
      </div>
    </header>
  );
};
