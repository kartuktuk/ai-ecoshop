import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice, totalCarbonImpact } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      // In a real app, you would integrate with a payment processor here
      await axios.post('/orders', {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        }))
      });
      
      toast.success('Order placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Your cart is empty
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Start shopping to add items to your cart
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

      <div className="mt-8">
        <div className="flow-root">
          <ul className="-my-6 divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.product._id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.product.name}</h3>
                      <p className="ml-4">${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="mt-1 flex text-sm text-gray-500">
                      <p>Carbon Impact: {item.product.carbonImpact}kg CO₂</p>
                      <p className="ml-4">
                        Sustainability Score: {item.product.sustainabilityScore}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center">
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product._id, Number(e.target.value))}
                        className="rounded-md border-gray-300 py-1.5 text-base leading-5 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="font-medium text-red-600 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 py-6">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal ({totalItems} items)</p>
          <p>${totalPrice.toFixed(2)}</p>
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <p>Total Carbon Impact</p>
          <p>{totalCarbonImpact.toFixed(2)}kg CO₂</p>
        </div>
        <div className="mt-6">
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </button>
        </div>
        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
          <p>
            or{' '}
            <Link
              to="/products"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Continue Shopping
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
