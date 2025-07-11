import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFootprint } from '../hooks/useFootprint';
import { LeafIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  items: {
    product: {
      name: string;
      price: number;
      imageUrl: string;
      carbonImpact: number;
    };
    quantity: number;
  }[];
  totalPrice: number;
  totalCarbon: number;
  tokensEarned: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { footprintData } = useFootprint();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Sustainability Stats */}
      {footprintData && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LeafIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Carbon Footprint
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {footprintData.personalStats.totalCarbon.toFixed(2)}kg CO₂
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Green Tokens
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {footprintData.rewards.greenTokens}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-0 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Carbon Savings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {footprintData.comparison.carbonSavings > 0
                        ? `${footprintData.comparison.percentageReduction.toFixed(1)}%`
                        : '0%'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-0 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ranking
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {footprintData.comparison.ranking}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Order History</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <li className="px-4 py-5 sm:px-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">No orders yet</p>
                <Link
                  to="/products"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Shopping
                </Link>
              </div>
            </li>
          ) : (
            orders.map((order) => (
              <li key={order._id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-col space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <p className="text-sm text-gray-500">
                          {item.quantity}x {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Carbon Impact: {order.totalCarbon.toFixed(2)}kg CO₂
                      </p>
                      <p className="text-sm text-gray-500">
                        Tokens Earned: {order.tokensEarned}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
