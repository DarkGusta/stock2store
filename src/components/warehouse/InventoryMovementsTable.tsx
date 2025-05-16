
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryMovement, Product } from '@/types';

interface InventoryMovementsTableProps {
  movements: InventoryMovement[];
  getProductById: (id: string) => Product | undefined;
}

const InventoryMovementsTable: React.FC<InventoryMovementsTableProps> = ({ 
  movements, 
  getProductById 
}) => {
  const formatDate = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Movements</CardTitle>
        <CardDescription>Recent stock entries and exits</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map(movement => {
              const product = getProductById(movement.productId);
              return (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Badge 
                      variant={movement.type === 'in' ? 'default' : 'outline'}
                      className={movement.type === 'in' ? 'bg-green-500' : 'text-red-500 border-red-500'}
                    >
                      {movement.type === 'in' ? (
                        <ArrowDown size={12} className="mr-1" />
                      ) : (
                        <ArrowUp size={12} className="mr-1" />
                      )}
                      {movement.type === 'in' ? 'Entry' : 'Exit'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product?.name || 'Unknown Product'}
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatDate(movement.timestamp)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    Warehouse Staff
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventoryMovementsTable;
