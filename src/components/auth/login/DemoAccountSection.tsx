
import React from 'react';
import { Button } from '@/components/ui/button';

// Demo accounts for testing
const demoAccounts = [
  { email: 'admin@stock2store.com', role: 'Admin' },
  { email: 'warehouse@stock2store.com', role: 'Warehouse' },
  { email: 'customer@stock2store.com', role: 'Customer' },
  { email: 'analyst@stock2store.com', role: 'Analyst' }
];

interface DemoAccountSectionProps {
  setEmail: (email: string) => void;
}

const DemoAccountSection: React.FC<DemoAccountSectionProps> = ({ setEmail }) => {
  return (
    <div className="mt-4 text-sm text-gray-500">
      <p className="text-center">Demo accounts:</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {demoAccounts.map((account, index) => (
          <Button 
            key={index}
            variant="outline"
            size="sm"
            className="text-xs justify-start overflow-hidden"
            onClick={() => setEmail(account.email)}
          >
            {account.email}
          </Button>
        ))}
      </div>
      <p className="text-center mt-2">Password for all: "password"</p>
      <p className="text-center mt-1 text-xs">
        Register new accounts using the Register tab above
      </p>
    </div>
  );
};

export default DemoAccountSection;
