import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiPhone, FiFileText } from 'react-icons/fi';
import Invoice from './Invoice';

const OrderHistory = () => {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
    fetchRestaurantInfo();
  }, []);

  const fetchRestaurantInfo = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.restaurantId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurants/${user.restaurantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRestaurantInfo(data.restaurant);
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant info:', error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurant-orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const ordersData = Array.isArray(data) ? data : data.orders || [];
        const completedOrders = ordersData.filter(order => 
          order.status === 'PAID' || order.status === 'CANCELLED'
        );
        setHistoryOrders(completedOrders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse-slow">📜</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-900 font-medium">Loading history...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn space-y-4">
      {selectedInvoice && (
        <Invoice 
          order={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)}
          restaurantInfo={restaurantInfo}
        />
      )}
      
      {historyOrders.length > 0 ? (
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white/30 backdrop-blur-md">
              <tr>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Customer</th>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Table</th>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Items</th>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Amount</th>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Status</th>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Date</th>
                <th className="px-3 lg:px-4 py-3 text-left font-bold text-gray-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/20 backdrop-blur-md">
              {historyOrders.map((order, index) => (
                <React.Fragment key={order._id}>
                  <tr 
                    className="border-t border-white/20 hover:bg-white/10 transition-all"
                  >
                    <td className="px-3 lg:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="flex-shrink-0"
                        >
                          <FiChevronDown className={`transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{order.customerName}</p>
                          {order.customerPhone && (
                            <p className="text-xs text-gray-700 truncate"><FiPhone className="inline mr-1" /> {order.customerPhone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-gray-900 text-sm">{order.tableNumber || 'N/A'}</td>
                    <td className="px-3 lg:px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {expandedOrder === order._id ? (
                          order.items?.map((item, idx) => (
                            <span key={idx} className="bg-white/30 backdrop-blur-md text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                              {item.quantity}x {item.name}
                            </span>
                          ))
                        ) : (
                          <>
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="bg-white/30 backdrop-blur-md text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="text-xs text-gray-700 whitespace-nowrap">+{order.items.length - 2} more</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-3 font-bold text-green-1000 text-sm whitespace-nowrap">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-3 lg:px-4 py-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                        order.status === 'DELIVERED' ? 'bg-green-600 text-white' :
                        order.status === 'READY' ? 'bg-blue-600 text-white' :
                        'bg-red-500/30 text-red-900 backdrop-blur-md'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                      <div>
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-3 lg:px-4 py-3">
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        title="View Invoice"
                      >
                        <FiFileText /> Invoice
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="text-6xl mb-4 animate-pulse-slow">📜</div>
          <p className="text-gray-500 text-lg font-medium">No order history available</p>
          <p className="text-gray-400 text-sm mt-2">Completed orders will appear here</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
