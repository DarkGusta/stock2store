
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryListViewProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  formatPrice: (price: number) => string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({
  products,
  onEdit,
  onDelete,
  formatPrice,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>{formatPrice(product.price)}</TableCell>
            <TableCell className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(product.id)}>
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600" 
                onClick={() => onDelete(product.id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InventoryListView;
