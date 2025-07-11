import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { LeafIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    sustainabilityScore: number;
    carbonImpact: number;
    category: string;
    inStock: boolean;
  };
  showActions?: boolean;
}

export const ProductCard = ({ product, showActions = true }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      // Handle not logged in state - you might want to redirect to login or show a modal
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product._id, quantity);
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-lime-100 text-lime-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    if (score >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      
      <div className="px-4 py-3">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          <p className="text-sm font-medium text-gray-900">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
              getSustainabilityColor(product.sustainabilityScore)
            )}
          >
            <LeafIcon className="mr-1 h-3 w-3" />
            {product.sustainabilityScore}
          </span>
          <span className="text-xs text-gray-500">
            Carbon Impact: {product.carbonImpact}kg CO₂
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500">{product.category}</p>

        {showActions && (
          <div className="mt-3 flex items-center gap-2">
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              disabled={!product.inStock || isAdding}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
              className={clsx(
                'flex-1 flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white',
                product.inStock
                  ? 'bg-indigo-600 hover:bg-indigo-500'
                  : 'bg-gray-400 cursor-not-allowed'
              )}
            >
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              {product.inStock ? (
                isAdding ? 'Adding...' : 'Add to Cart'
              ) : (
                'Out of Stock'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
