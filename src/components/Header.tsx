import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface HeaderProps {
  isLocked: boolean;
  onLockToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLocked, onLockToggle }) => {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Company Wiki</h1>
        <div className="flex items-center space-x-2">
          <span>{isLocked ? <Lock /> : <Unlock />}</span>
          <Switch checked={!isLocked} onCheckedChange={onLockToggle} />
        </div>
      </div>
    </header>
  );
};

export default Header;
