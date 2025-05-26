
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
  status: 'available' | 'reserved' | 'unavailable';
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'UPDATE_ITEM_STATUS'; payload: { productId: string; status: 'available' | 'reserved' | 'unavailable' } };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          product,
          quantity: Math.min(quantity, product.stock),
          addedAt: new Date(),
          status: product.stock > 0 ? 'available' : 'unavailable',
        };
        newItems = [...state.items, newItem];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }
      
      const newItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'UPDATE_ITEM_STATUS': {
      const { productId, status } = action.payload;
      const newItems = state.items.map(item =>
        item.product.id === productId ? { ...item, status } : item
      );
      
      return { ...state, items: newItems };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, itemCount: 0 };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ITEMS': {
      const items = action.payload;
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items, total, itemCount };
    }
    
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart-${user.id}`);
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart) as CartItem[];
          dispatch({ type: 'SET_ITEMS', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user && state.items.length >= 0) {
      localStorage.setItem(`cart-${user.id}`, JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      toast({
        title: "Product unavailable",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    const existingQuantity = getCartItemQuantity(product.id);
    const totalQuantity = existingQuantity + quantity;
    
    if (totalQuantity > product.stock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stock} items available. You already have ${existingQuantity} in your cart.`,
        variant: "destructive",
      });
      return;
    }

    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getCartItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
