
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { createAllDemoAccounts } from '@/services/auth';
import { useToast } from '@/components/ui/use-toast';

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
  const [creatingDemoAccounts, setCreatingDemoAccounts] = React.useState(false);
  const [demoCreationStatus, setDemoCreationStatus] = React.useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleCreateDemoAccounts = async () => {
    setCreatingDemoAccounts(true);
    
    try {
      const results = await createAllDemoAccounts(demoAccounts);
      setDemoCreationStatus(results);
      
      toast({
        title: "Demo accounts setup",
        description: "Process completed. You can now login with any of the available demo accounts using password: 'password'",
      });
    } catch (error) {
      console.error("Error setting up demo accounts:", error);
      toast({
        title: "Demo account setup failed",
        description: "An unexpected error occurred. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setCreatingDemoAccounts(false);
    }
  };

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
      
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Demo Accounts
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Demo Accounts</DialogTitle>
            <DialogDescription>
              This will create all demo accounts with the password "password".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(demoCreationStatus).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status:</h4>
                <ul className="text-sm space-y-1">
                  {Object.entries(demoCreationStatus).map(([email, success]) => (
                    <li key={email} className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {email}: {success ? 'Created' : 'Failed'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button 
              onClick={handleCreateDemoAccounts} 
              disabled={creatingDemoAccounts}
              className="w-full"
            >
              {creatingDemoAccounts ? "Creating..." : "Create All Demo Accounts"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoAccountSection;
