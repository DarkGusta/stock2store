
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate('/cart')}
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartIcon;
