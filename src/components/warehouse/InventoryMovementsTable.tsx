
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp, Package } from 'lucide-react';
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

  const getMovementTypeDisplay = (movement: InventoryMovement) => {
    if (movement.reason.includes('sold') || movement.reason.includes('sale')) {
      return { label: 'Sale', color: 'bg-red-500', icon: ArrowUp };
    }
    if (movement.reason.includes('repair') || movement.reason.includes('damaged')) {
      return { label: 'Repair', color: 'bg-yellow-500', icon: ArrowDown };
    }
    if (movement.reason.includes('available') || movement.reason.includes('restored')) {
      return { label: 'Restored', color: 'bg-green-500', icon: ArrowDown };
    }
    return { 
      label: movement.type === 'in' ? 'Entry' : 'Exit', 
      color: movement.type === 'in' ? 'bg-green-500' : 'bg-red-500',
      icon: movement.type === 'in' ? ArrowDown : ArrowUp
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Movements
        </CardTitle>
        <CardDescription>Recent stock entries, exits, sales, and repairs</CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No inventory movements recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Serial ID</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(movement => {
                const product = getProductById(movement.productId);
                const typeDisplay = getMovementTypeDisplay(movement);
                const IconComponent = typeDisplay.icon;
                
                return (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`text-white border-none ${typeDisplay.color}`}
                      >
                        <IconComponent size={12} className="mr-1" />
                        {typeDisplay.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product?.name || movement.productName || 'Unknown Product'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {movement.serialId || 'N/A'}
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell className="max-w-xs truncate">{movement.reason}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {movement.orderNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(movement.timestamp)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {movement.userName || 'System'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryMovementsTable;
