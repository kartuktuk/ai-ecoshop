import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    sustainabilityScore: number;
    carbonImpact: number;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalCarbonImpact: number;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch cart on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/cart');
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post('/cart/add', { productId, quantity });
      setItems(data.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.put('/cart/update', { productId, quantity });
      setItems(data.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.delete(`/cart/remove/${productId}`);
      setItems(data.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error removing item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalCarbonImpact = items.reduce((total, item) => total + (item.product.carbonImpact * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        totalCarbonImpact
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
