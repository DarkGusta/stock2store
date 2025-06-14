import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp, Package, RotateCcw, Clock, Ban } from 'lucide-react';
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
    const reasonLower = movement.reason.toLowerCase();
    const transactionType = reasonLower;
    
    // Check for pending/reserved status first (when order is placed but not yet accepted)
    if (transactionType.includes('reserved') || transactionType.includes('pending')) {
      return { 
        label: 'Reserved', 
        color: 'bg-blue-500', 
        icon: Clock,
        description: 'Item reserved for pending order'
      };
    }
    
    // Check for sale transactions (only after order is accepted)
    if (transactionType.includes('sale') || transactionType.includes('sold')) {
      return { 
        label: 'Sale', 
        color: 'bg-red-500', 
        icon: ArrowUp,
        description: 'Item sold to customer'
      };
    }
    
    // Check for rejected/unavailable status
    if (transactionType.includes('rejected') || transactionType.includes('unavailable')) {
      return { 
        label: 'Rejected', 
        color: 'bg-gray-500', 
        icon: Ban,
        description: 'Order rejected, item marked unavailable'
      };
    }
    
    // Check for refund transactions
    if (transactionType.includes('refund')) {
      return { 
        label: 'Refund', 
        color: 'bg-yellow-500', 
        icon: RotateCcw,
        description: 'Item returned due to refund'
      };
    }
    
    // Check for repair/damage transactions
    if (transactionType.includes('repair') || transactionType.includes('damaged')) {
      return { 
        label: 'Repair', 
        color: 'bg-orange-500', 
        icon: ArrowDown,
        description: 'Item sent for repair or marked as damaged'
      };
    }
    
    // Check for available/restored status
    if (transactionType.includes('available') || transactionType.includes('restored')) {
      return { 
        label: 'Restored', 
        color: 'bg-green-500', 
        icon: ArrowDown,
        description: 'Item restored to available status'
      };
    }
    
    // Default fallback
    return { 
      label: movement.type === 'in' ? 'Entry' : 'Exit', 
      color: movement.type === 'in' ? 'bg-green-500' : 'bg-red-500',
      icon: movement.type === 'in' ? ArrowDown : ArrowUp,
      description: movement.type === 'in' ? 'Item added to inventory' : 'Item removed from inventory'
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Movements
        </CardTitle>
        <CardDescription>Recent inventory transactions including sales, refunds, reservations, and status changes</CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No inventory movements recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Serial ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Customer</TableHead>
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
                    <TableRow key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`text-white border-none ${typeDisplay.color}`}
                          title={typeDisplay.description}
                        >
                          <IconComponent size={12} className="mr-1" />
                          {typeDisplay.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{product?.name || movement.productName || 'Unknown Product'}</div>
                          {product?.category && (
                            <div className="text-xs text-gray-500">{product.category}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {movement.serialId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{movement.quantity}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={movement.reason}>
                          {movement.reason}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {movement.customerName && movement.customerName !== 'Unknown Customer' ? (
                          <div>
                            <div className="font-medium">{movement.customerName}</div>
                            <div className="text-xs text-gray-500">{movement.customerEmail}</div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {movement.orderNumber ? (
                          <span className="font-mono">{movement.orderNumber}</span>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        <div title={new Date(movement.timestamp).toLocaleString()}>
                          {formatDate(movement.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        <div>
                          <div className="font-medium">{movement.userName || 'System'}</div>
                          {(movement as any).userRole && (movement as any).userRole !== 'unknown' && (
                            <div className="text-xs text-gray-400 capitalize">{(movement as any).userRole}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryMovementsTable;
