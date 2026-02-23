import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiUser, FiShoppingBag, FiFileText, FiChevronDown, FiCheckCircle, FiClock, FiChevronLeft } from 'react-icons/fi';
import axios from 'axios';

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrderItems, setExpandedOrderItems] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/inroom-orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500 text-white',
    preparing: 'bg-orange-500 text-white',
    ready: 'bg-green-500 text-white',
    served: 'bg-[#c2ab65] text-[#1f2937]',
    completed: 'bg-[#1f2937] text-[#c2ab65]',
    cancelled: 'bg-red-500 text-white'
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const printKOT = (orderId) => {
    window.open(`/inroom-dining/kot/${orderId}`, '_blank');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/inroom-orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Update selected order
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-[#1f2937] rounded-2xl p-4 mb-6 shadow-lg border border-[#c2ab65]">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#c2ab65]">In-Room Dine-In Orders</h2>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-[#374151] hover:bg-[#4b5563] text-gray-300 rounded-xl transition-colors border border-gray-600"
          >
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Order List */}
        <div className="bg-[#1f2937] rounded-2xl overflow-hidden lg:col-span-1 shadow-lg border border-[#c2ab65]">
          <div className="p-4 border-b border-[#c2ab65]">
            <h3 className="text-xl font-bold text-[#c2ab65]">
              <FiShoppingBag className="inline mr-2" />
              Orders ({filteredOrders.length})
            </h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c2ab65] border-t-transparent"></div>
              </div>
            ) : (
              <>
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-[#2d3748] rounded-xl p-4 cursor-pointer transition-colors hover:bg-[#374151] border ${
                      selectedOrder?._id === order._id ? 'border-[#c2ab65] shadow-lg' : 'border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">{order.customerName || 'Guest'}</h4>
                        <p className="text-xs text-gray-300">Room {order.tableNo || 'N/A'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[order.status] || 'bg-gray-500 text-white'}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-300 text-sm cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setExpandedOrderItems(expandedOrderItems === order._id ? null : order._id);
                      }}>
                        <div className="flex items-center gap-1">
                          <FiChevronDown className={`transition-transform ${expandedOrderItems === order._id ? 'rotate-180' : ''}`} />
                          <span>{(order.items || []).length} items</span>
                        </div>
                        {expandedOrderItems === order._id && (
                          <div className="mt-2 space-y-1">
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-400">{item.quantity}x {item.itemName || item.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-[#c2ab65]">{formatCurrency(order.amount)}</span>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-10">
                    <FiShoppingBag className="text-5xl mb-3 mx-auto text-gray-500" />
                    <p className="text-gray-400 font-medium">No orders found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Order Details */}
        <div className="bg-[#1f2937] rounded-2xl overflow-hidden lg:col-span-2 shadow-lg border border-[#c2ab65]">
          {selectedOrder ? (
            <>
              <div className="p-4 border-b border-[#c2ab65]">
                <h3 className="text-xl font-bold text-[#c2ab65]">
                  <FiFileText className="inline mr-2" />
                  Order Details
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Customer Info & Order Items */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="bg-[#2d3748] rounded-xl p-4 border border-gray-600">
                    <h4 className="font-bold text-[#c2ab65] mb-3">
                      <FiUser className="inline mr-2" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><span className="font-medium">Name:</span> {selectedOrder.customerName || 'Guest'}</p>
                      <p className="text-white"><span className="font-medium">Room:</span> {selectedOrder.tableNo || 'N/A'}</p>
                      <p className="text-white"><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <h5 className="font-semibold text-[#c2ab65] mb-2 text-xs">Payment Breakdown</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-300">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>SGST ({selectedOrder.sgstRate || 0}%):</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.sgstAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>CGST ({selectedOrder.cgstRate || 0}%):</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.cgstAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-600 font-bold text-[#c2ab65]">
                          <span>Total:</span>
                          <span className="text-sm">{formatCurrency(selectedOrder.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-[#2d3748] rounded-xl p-4 border border-gray-600">
                    <h4 className="font-bold text-[#c2ab65] mb-3">
                      <FiShoppingBag className="inline mr-2" />
                      Order Items
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(selectedOrder.items || []).map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm p-2 rounded-lg bg-[#374151]">
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.quantity}x {item.itemName || item.name}</p>
                            {item.variation && <p className="text-xs text-gray-300">Variation: {item.variation.name}</p>}
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-xs text-gray-300">Addons: {item.addons.map(a => a.name).join(', ')}</p>
                            )}
                          </div>
                          <span className="font-bold text-[#c2ab65]">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="bg-[#2d3748] rounded-xl p-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                        className="px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#c2ab65]"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="served">Served</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <span className="text-2xl font-bold text-[#c2ab65]">{formatCurrency(selectedOrder.amount)}</span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedOrder.status === 'served' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'completed')}
                        className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
                      >
                        <FiCheckCircle className="inline mr-1" />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/inroomdinein/invoice/${selectedOrder._id}`)}
                      className="flex-1 p-3 bg-[#374151] hover:bg-[#4b5563] text-white rounded-xl font-semibold transition-colors border border-gray-600"
                    >
                      <FiFileText className="inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => printKOT(selectedOrder._id)}
                      className="flex-1 p-3 bg-[#c2ab65] hover:bg-[#d4bc7a] text-[#1f2937] rounded-xl font-semibold transition-colors shadow-lg"
                    >
                      <FiClock className="inline mr-1" />
                      POS
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-10">
              <div className="text-center">
                <FiChevronLeft className="text-6xl mb-4 mx-auto text-gray-500" />
                <p className="text-gray-400 font-medium text-lg">Select an order to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllOrders;
