import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);

  const handleUnlockToggle = useCallback((checked: boolean) => {
    if (checked && !isUnlocked) {
      setIsPasswordPromptOpen(true);
    } else if (!checked && isUnlocked) {
      setIsUnlocked(false);
    }
  }, [isUnlocked]);

  const handlePasswordSubmit = useCallback(async (password: string) => {
    try {
      const response = await fetch('/api/wiki/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsUnlocked(true);
        setIsPasswordPromptOpen(false);
      } else {
        toast.error('Incorrect password');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      toast.error('Authentication failed');
    }
  }, []);

  return {
    isUnlocked,
    isPasswordPromptOpen,
    setIsPasswordPromptOpen,
    handleUnlockToggle,
    handlePasswordSubmit
  };
};