import React, { useState } from 'react';
import { FiRefreshCw, FiUser, FiPhone, FiGrid, FiShoppingBag, FiFileText, FiPlus, FiRotateCcw, FiCreditCard, FiChevronDown, FiCheckCircle, FiEye, FiClock, FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import axios from 'axios';

const OrderList = ({ orders, onViewOrder, onUpdateStatus, onProcessPayment, onRefresh, onUpdatePriority, onTransfer, onAddItems, onViewSplitBill, activeTab, setActiveTab }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrderItems, setExpandedOrderItems] = useState(null);
  const [refreshingList, setRefreshingList] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  const canUpdateItemStatus = true; // Allow all users to update item status

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateElapsedTime = (startedAt, status) => {
    if (status === 'READY' || status === 'SERVED') return null;
    if (!startedAt) return null;
    const elapsed = Math.floor((currentTime - new Date(startedAt).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return { minutes, seconds, totalSeconds: elapsed };
  };

  const getTimerColor = (elapsed, prepTime) => {
    const percentage = (elapsed / (prepTime * 60)) * 100;
    if (percentage >= 100) return 'text-red-600 font-bold';
    if (percentage >= 80) return 'text-orange-600 font-bold';
    if (percentage >= 60) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getProgressColor = (elapsed, prepTime) => {
    const percentage = (elapsed / (prepTime * 60)) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  
  

  const statusColors = {
    PENDING: 'bg-yellow-500 text-white',
    PREPARING: 'bg-orange-500 text-white',
    READY: 'bg-green-500 text-white',
    DELIVERED: 'bg-[#c2ab65] text-[#1f2937]',
    CANCELLED: 'bg-red-500 text-white',
    PAID: 'bg-[#1f2937] text-[#c2ab65]'
  };

  const filteredOrders = (filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order && order.status === filterStatus)).filter(order => order && order._id);

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

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Set first order as selected by default
  React.useEffect(() => {
    if (filteredOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(filteredOrders[0]);
    }
  }, [filteredOrders, selectedOrder]);

  const handleRefresh = async () => {
    setRefreshingList(true);
    await onRefresh();
    setRefreshingList(false);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleItemStatusChange = async (orderId, itemIndex, newStatus, isExtraItem = false) => {
    setUpdatingItem(`${orderId}-${isExtraItem ? 'extra-' : ''}${itemIndex}`);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isExtraItem 
        ? `${API_URL}/api/restaurant-orders/${orderId}/extra-item-status/${itemIndex}`
        : `${API_URL}/api/restaurant-orders/${orderId}/item-status/${itemIndex}`;
      
      const response = await axios.patch(endpoint, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update both selected order and orders list
      const updatedOrderData = response.data.order;
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updatedOrderData);
      }
      
      // Update in orders list without full refresh
      const updatedOrders = orders.map(order => 
        order._id === orderId ? updatedOrderData : order
      );
      // Trigger parent update if available
      if (onRefresh) {
        onRefresh(updatedOrders);
      }
    } catch (error) {
      console.error('Failed to update item status:', error);
      alert('Failed to update item status');
    } finally {
      setUpdatingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side - Order List */}
        <div className="bg-[#1f2937] rounded-2xl overflow-hidden lg:col-span-1 self-start sticky top-6 shadow-lg border border-[#c2ab65]">
          <div className="p-4 border-b border-[#c2ab65]">
            <h3 className="text-xl font-bold text-[#c2ab65]"><FiShoppingBag className="inline mr-2" />Orders ({filteredOrders.length})</h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-4 space-y-3">
            {refreshingList ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c2ab65] border-t-transparent"></div>
              </div>
            ) : (
              <>
                {filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleOrderClick(order)}
                className={`bg-[#2d3748] rounded-xl p-4 cursor-pointer transition-colors hover:bg-[#374151] border ${
                  selectedOrder?._id === order._id ? 'border-[#c2ab65] shadow-lg' : 'border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white">{order.customerName}</h4>
                    <p className="text-xs text-gray-300"><FiGrid className="inline mr-1" />{order.tableNumber || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[order.status]}`}>
                    {order.status}
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
                        {(order.items || []).filter(item => item).map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-400">{item.quantity}x {item.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-[#c2ab65]">{formatCurrency(order.totalAmount)}</span>
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
              <div className="p-4">
                <h3 className="text-xl font-bold text-[#c2ab65]"><FiFileText className="inline mr-2" />Order Details</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Customer Info & Order Items in Same Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="bg-[#2d3748] rounded-xl p-4 border border-gray-600">
                    <h4 className="font-bold text-[#c2ab65] mb-3"><FiUser className="inline mr-2" />Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                      {selectedOrder.customerPhone && (
                        <p className="text-white"><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                      )}
                      <p className="text-white"><span className="font-medium">Table:</span> {selectedOrder.tableNumber || 'N/A'}</p>
                      {selectedOrder.mergedTableNumbers && selectedOrder.mergedTableNumbers.length > 0 && (
                        <p className="text-[#c2ab65] font-medium"><FiRotateCcw className="inline mr-1" />Merged: {selectedOrder.mergedTableNumbers.join(', ')}</p>
                      )}
                    </div>

                    {/* Payment Breakdown */}
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <h5 className="font-semibold text-[#c2ab65] mb-2 text-xs">Payment Breakdown</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-300">
                          <span>Items Total:</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                        </div>
                        {selectedOrder.discount && selectedOrder.discount.amount > 0 && (
                          <div className="flex justify-between text-red-400">
                            <span>Discount ({selectedOrder.discount.percentage}%):</span>
                            <span className="font-medium">-{formatCurrency(selectedOrder.discount.amount)}</span>
                          </div>
                        )}
                        {(selectedOrder.gst > 0 || selectedOrder.sgst > 0) && (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>GST (2.5%):</span>
                              <span className="font-medium">{formatCurrency(selectedOrder.gst || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>SGST (2.5%):</span>
                              <span className="font-medium">{formatCurrency(selectedOrder.sgst || 0)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-600 font-bold text-[#c2ab65]">
                          <span>Total:</span>
                          <span className="text-sm">{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-[#2d3748] rounded-xl p-4 border border-gray-600">
                    <h4 className="font-bold text-[#c2ab65] mb-3"><FiShoppingBag className="inline mr-2" />Order Items</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(selectedOrder.items || []).filter(item => item).map((item, index) => {
                        const elapsed = calculateElapsedTime(item.startedAt, item.status);
                        const prepTime = item.timeToPrepare || 15;
                        const progress = elapsed ? Math.min((elapsed.totalSeconds / (prepTime * 60)) * 100, 100) : 100;
                        
                        return (
                        <div key={index} className="flex justify-between items-start text-sm p-2 rounded-lg bg-[#374151]">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-white">{item.quantity}x {item.name}</p>
                              {canUpdateItemStatus ? (
                                <select
                                  value={item.status || 'PENDING'}
                                  onChange={(e) => handleItemStatusChange(selectedOrder._id, index, e.target.value, false)}
                                  disabled={updatingItem === `${selectedOrder._id}-${index}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] px-2 py-0.5 rounded-full font-bold border-0 focus:ring-1 focus:ring-[#c2ab65] bg-yellow-500 text-white"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="PREPARING">PREPARING</option>
                                  <option value="READY">READY</option>
                                  <option value="SERVED">SERVED</option>
                                </select>
                              ) : (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  item.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                  item.status === 'PREPARING' ? 'bg-orange-500 text-white' :
                                  item.status === 'READY' ? 'bg-green-500 text-white' :
                                  item.status === 'SERVED' ? 'bg-purple-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {item.status || 'PENDING'}
                                </span>
                              )}
                              {item.status === 'PREPARING' && elapsed && (
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${getTimerColor(elapsed.totalSeconds, prepTime)} bg-[#1f2937]`}>
                                  ⏱ {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            {item.variation && <p className="text-xs text-gray-300">Variation: {item.variation.name}</p>}
                            {item.status === 'PREPARING' && elapsed && (
                              <>
                                <div className="w-full bg-gray-600 rounded-full h-1 mt-1 overflow-hidden">
                                  <div 
                                    className={`h-1 rounded-full transition-all duration-500 ${getProgressColor(elapsed.totalSeconds, prepTime)}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="text-[9px] text-gray-400 mt-0.5">
                                  Target: {prepTime}min {progress >= 100 && <span className="text-red-600 font-bold">⚠️ DELAYED</span>}
                                </div>
                              </>
                            )}
                          </div>
                          <span className="font-bold text-[#c2ab65]">{formatCurrency(item.itemTotal || (item.variation?.price * item.quantity) || (item.basePrice * item.quantity) || 0)}</span>
                        </div>
                      );})}
                      {selectedOrder.extraItems && selectedOrder.extraItems.length > 0 && (
                        <>
                          <div className="border-t border-red-500 pt-2 mt-2">
                            <p className="text-[10px] font-bold text-red-400 mb-1">NEW ITEMS</p>
                          </div>
                          {selectedOrder.extraItems.map((item, index) => {
                            const elapsed = calculateElapsedTime(item.startedAt, item.status);
                            const prepTime = item.timeToPrepare || 15;
                            const progress = elapsed ? Math.min((elapsed.totalSeconds / (prepTime * 60)) * 100, 100) : 100;
                            
                            return (
                            <div key={`extra-${index}`} className="flex justify-between items-start text-sm p-2 rounded-lg bg-[#374151] border border-red-500">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-white">{item.quantity}x {item.name}</p>
                                  {canUpdateItemStatus ? (
                                    <select
                                      value={item.status || 'PENDING'}
                                      onChange={(e) => handleItemStatusChange(selectedOrder._id, index, e.target.value, true)}
                                      disabled={updatingItem === `${selectedOrder._id}-extra-${index}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[10px] px-2 py-0.5 rounded-full font-bold border-0 focus:ring-1 focus:ring-[#c2ab65] bg-yellow-500 text-white"
                                    >
                                      <option value="PENDING">PENDING</option>
                                      <option value="PREPARING">PREPARING</option>
                                      <option value="READY">READY</option>
                                      <option value="SERVED">SERVED</option>
                                    </select>
                                  ) : (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      item.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                      item.status === 'PREPARING' ? 'bg-orange-500 text-white' :
                                      item.status === 'READY' ? 'bg-green-500 text-white' :
                                      item.status === 'SERVED' ? 'bg-purple-500 text-white' :
                                      'bg-gray-500 text-white'
                                    }`}>
                                      {item.status || 'PENDING'}
                                    </span>
                                  )}
                                  {item.status === 'PREPARING' && elapsed && (
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${getTimerColor(elapsed.totalSeconds, prepTime)} bg-[#1f2937]`}>
                                      ⏱ {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
                                    </span>
                                  )}
                                </div>
                                {item.variation && <p className="text-xs text-gray-300">Variation: {item.variation.name}</p>}
                                {item.status === 'PREPARING' && elapsed && (
                                  <>
                                    <div className="w-full bg-gray-600 rounded-full h-1 mt-1 overflow-hidden">
                                      <div 
                                        className={`h-1 rounded-full transition-all duration-500 ${getProgressColor(elapsed.totalSeconds, prepTime)}`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <div className="text-[9px] text-gray-400 mt-0.5">
                                      Target: {prepTime}min {progress >= 100 && <span className="text-red-600 font-bold">⚠️ DELAYED</span>}
                                    </div>
                                  </>
                                )}
                              </div>
                              <span className="font-bold text-[#c2ab65]">{formatCurrency(item.itemTotal || item.total || 0)}</span>
                            </div>
                          );})}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary & Actions */}
                <div className="bg-[#2d3748] rounded-xl p-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          onUpdateStatus(selectedOrder._id, newStatus);
                          setSelectedOrder({ ...selectedOrder, status: newStatus });
                        }}
                        className="px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#c2ab65]"
                      >
                        <option value="READY">Ready</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <span className="text-2xl font-bold text-[#c2ab65]">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELLED' && (
                      <button
                        onClick={() => onAddItems && onAddItems(selectedOrder._id)}
                        className="flex-1 p-3 bg-[#374151] hover:bg-[#4b5563] text-white rounded-xl font-medium transition-colors border border-gray-600"
                      >
                        <FiPlus className="inline mr-1" />Add
                      </button>
                    )}
                    {selectedOrder.tableId && selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELLED' && (
                      <button
                        onClick={() => onTransfer(selectedOrder)}
                        className="flex-1 p-3 bg-[#374151] hover:bg-[#4b5563] text-white rounded-xl font-medium transition-colors border border-gray-600"
                      >
                        <FiRotateCcw className="inline mr-1" />Transfer
                      </button>
                    )}
                    {selectedOrder.hasSplitBill && selectedOrder.status !== 'PAID' && (
                      <button
                        onClick={() => onViewSplitBill && onViewSplitBill(selectedOrder)}
                        className="flex-1 p-3 bg-[#c2ab65] text-[#1f2937] rounded-xl font-medium transition-colors shadow-md hover:bg-[#d4bc7a]"
                      >
                        <FiEye className="inline mr-1" />View Split
                      </button>
                    )}
                    {selectedOrder.status === 'DELIVERED' && !selectedOrder.hasSplitBill && (
                      <button
                        onClick={() => onProcessPayment(selectedOrder)}
                        className="flex-1 p-3 bg-green-600 text-white rounded-xl font-medium transition-colors shadow-md hover:bg-green-700"
                      >
                        <FiCreditCard className="inline mr-1" />Pay
                      </button>
                    )}
                    {selectedOrder.status === 'PAID' && (
                      <div className="flex-1 p-3 bg-green-900 text-green-300 rounded-xl font-medium text-center border border-green-700">
                        <FiCheckCircle className="inline mr-1" />Paid
                      </div>
                    )}
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

export default OrderList;
