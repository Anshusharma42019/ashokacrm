import React, { useState } from 'react';
import { FiPlus, FiEye, FiClipboard, FiRefreshCw, FiArchive, FiList, FiAlertTriangle } from 'react-icons/fi';
import OrderList from './OrderList';
import CreateOrder from './CreateOrder';
import OrderDetails from './OrderDetails';
import OrderHistory from './OrderHistory';
import PaymentModal from '../Payment/PaymentModal';
import SplitBillPayment from '../Payment/SplitBillPayment';
import TransferModal from './TransferModal';
import AddNewOrder from '../AddNewOrder';
import { useOrders } from './hooks/useOrders';
import axios from 'axios';

const Order = () => {
  const [showAddItems, setShowAddItems] = useState(null);
  const [showSplitBillView, setShowSplitBillView] = useState(null);
  const {
    orders,
    loading,
    error,
    activeTab,
    setActiveTab,
    selectedOrder,
    setSelectedOrder,
    showPaymentModal,
    setShowPaymentModal,
    showTransferModal,
    setShowTransferModal,
    fetchOrders,
    handleCreateOrder,
    handleUpdateStatus,
    handleUpdatePriority,
    handleProcessPayment,
    handleViewOrder,
    handlePaymentClick,
    handleTransferClick,
    handleTransferSuccess
  } = useOrders();

  const handleAddItems = (orderId) => {
    
    setShowAddItems(orderId);
  };

  const handleAddItemsClose = (shouldRefresh = false) => {
    setShowAddItems(null);
    if (shouldRefresh) {
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-100">
      <div className="max-w-auto mx-auto">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-xl mb-6 animate-slideIn">
            <div className="flex items-center space-x-2">
              <FiAlertTriangle className="text-2xl" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Persistent Navigation Header */}
        <div className="bg-[#1f2937] rounded-2xl p-3 sm:p-4 mb-6 shadow-lg border border-[#c2ab65]">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all text-sm ${
                  activeTab === 'list' 
                    ? 'bg-[#c2ab65] text-[#1f2937] shadow-md' 
                    : 'bg-[#374151] text-gray-300 hover:bg-[#4b5563]'
                }`}
              >
                <FiClipboard />
                <span className="hidden sm:inline">Orders</span>
              </button>
              
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all text-sm ${
                  activeTab === 'create' 
                    ? 'bg-[#c2ab65] text-[#1f2937] shadow-md' 
                    : 'bg-[#374151] text-gray-300 hover:bg-[#4b5563]'
                }`}
              >
                <FiPlus />
                <span className="hidden sm:inline">New Order</span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all text-sm ${
                  activeTab === 'history' 
                    ? 'bg-[#c2ab65] text-[#1f2937] shadow-md' 
                    : 'bg-[#374151] text-gray-300 hover:bg-[#4b5563]'
                }`}
              >
                <FiArchive />
                <span className="hidden sm:inline">History</span>
              </button>
              
              <select
                className="flex-1 sm:flex-none bg-[#374151] border border-gray-600 text-gray-300 rounded-xl px-3 sm:px-6 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#c2ab65] transition-all font-medium text-sm"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchOrders}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#374151] hover:bg-[#4b5563] text-gray-300 rounded-xl transition-colors font-medium text-sm border border-gray-600"
              >
                <FiRefreshCw />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c2ab65] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-300 font-medium text-lg">Loading orders...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'list' && (
              <div className="animate-fadeIn">
                <OrderList
                  orders={orders}
                  onViewOrder={handleViewOrder}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdatePriority={handleUpdatePriority}
                  onProcessPayment={handlePaymentClick}
                  onAddItems={handleAddItems}
                  onTransfer={handleTransferClick}
                  onRefresh={fetchOrders}
                  onViewSplitBill={(order) => setShowSplitBillView(order)}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showNavigation={false}
                />
              </div>
            )}

            {activeTab === 'create' && (
              <div className="animate-fadeIn">
                <CreateOrder
                  onCreateOrder={handleCreateOrder}
                  onCancel={() => setActiveTab('list')}
                />
              </div>
            )}

            {activeTab === 'details' && selectedOrder && (
              <OrderDetails
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
                onProcessPayment={handlePaymentClick}
                onBack={() => setActiveTab('list')}
              />
            )}

            {activeTab === 'history' && (
              <div className="animate-fadeIn">
                <OrderHistory />
              </div>
            )}

            {showPaymentModal && selectedOrder && (
              <PaymentModal
                order={selectedOrder}
                onProcessPayment={handleProcessPayment}
                onClose={() => setShowPaymentModal(false)}
              />
            )}

            {showAddItems && (
              <div>
                <p>Debug: showAddItems = {showAddItems}</p>
                <AddNewOrder
                  orderId={showAddItems}
                  onClose={handleAddItemsClose}
                />
              </div>
            )}

            {showTransferModal && selectedOrder && (
              <TransferModal
                order={selectedOrder}
                onClose={() => {
                  setShowTransferModal(false);
                  setSelectedOrder(null);
                }}
                onSuccess={handleTransferSuccess}
              />
            )}

            {showSplitBillView && (
              <SplitBillPayment
                orderId={showSplitBillView._id}
                onClose={() => setShowSplitBillView(null)}
                onPaymentComplete={() => {
                  setShowSplitBillView(null);
                  fetchOrders();
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Order;
