import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCheckCircle, FiClock } from 'react-icons/fi';

const SplitBillPayment = ({ orderId, onClose, splitBillData, onPaymentComplete }) => {
  const [splitBill, setSplitBill] = useState(splitBillData || null);
  const [loading, setLoading] = useState(!splitBillData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!splitBillData) {
      fetchSplitBill();
    }
  }, [orderId, splitBillData]);

  const fetchSplitBill = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/split-bill/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSplitBill(data.splitBill);
      setError(null);
    } catch (error) {
      console.error('Error fetching split bill:', error);
      setError(error.response?.data?.error || 'Split bill not found');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (splitNumber, method) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/split-bill/payment/${splitBill._id}/${splitNumber}`,
        { method, transactionId: `TXN${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment processed successfully!');
      setSplitBill(data.splitBill);
      
      if (data.allPaid) {
        setTimeout(() => {
          alert('✅ All splits paid! Order completed.');
          if (onPaymentComplete) onPaymentComplete();
          onClose();
        }, 500);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process payment');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-900 font-medium">Loading split bill...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">No Split Bill Found</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
              <FiX size={24} />
            </button>
          </div>
          <div className="bg-yellow-50/50 backdrop-blur-md rounded-xl p-4 mb-4 border border-yellow-200/30">
            <p className="text-gray-700 mb-2">This order hasn't been split yet.</p>
            <p className="text-sm text-gray-600">Click "Split Bill" to create a split payment for this order.</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!splitBill) return null;

  const allPaid = splitBill.splits.every(s => s.paymentStatus === 'PAID');
  const paidCount = splitBill.splits.filter(s => s.paymentStatus === 'PAID').length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-white/90 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">💳 Split Bill Payment</h2>
            <p className="text-sm text-gray-600 mt-1">Pay each split individually</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">Payment Status</p>
                <p className="text-lg font-bold text-gray-900">{splitBill.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">Progress</p>
                <p className="text-lg font-bold text-purple-600">{paidCount} / {splitBill.splits.length} Paid</p>
              </div>
              {allPaid && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  <FiCheckCircle size={20} />
                  <span className="font-bold">All Paid</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {splitBill.splits.map((split) => (
              <div key={split.splitNumber} className="bg-white/30 backdrop-blur-md rounded-xl p-5 border border-white/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{split.customerName}</h3>
                    <p className="text-sm text-gray-600">Split #{split.splitNumber}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold ${
                    split.paymentStatus === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {split.paymentStatus === 'PAID' ? <FiCheckCircle size={16} /> : <FiClock size={16} />}
                    {split.paymentStatus}
                  </div>
                </div>

                <div className="mb-4 space-y-2 bg-white/40 backdrop-blur-md rounded-lg p-3 border border-white/30">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{split.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>GST (2.5%):</span>
                    <span className="font-medium">₹{split.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>SGST (2.5%):</span>
                    <span className="font-medium">₹{split.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-white/30 pt-2 text-gray-900">
                    <span>Total:</span>
                    <span className="text-green-600">₹{split.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {split.items && split.items.length > 0 && (
                  <div className="mb-4 bg-white/40 backdrop-blur-md rounded-lg p-3 border border-white/30">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Items:</p>
                    <div className="space-y-1">
                      {split.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-700 flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-medium">₹{item.itemTotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {split.paymentStatus === 'PENDING' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => processPayment(split.splitNumber, 'CASH')}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 text-sm font-medium shadow-md transition-all"
                    >
                      💵 Cash
                    </button>
                    <button
                      onClick={() => processPayment(split.splitNumber, 'CARD')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 text-sm font-medium shadow-md transition-all"
                    >
                      💳 Card
                    </button>
                    <button
                      onClick={() => processPayment(split.splitNumber, 'UPI')}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 text-sm font-medium shadow-md transition-all"
                    >
                      📱 UPI
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50/50 backdrop-blur-md rounded-lg p-3 border border-green-200/30">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <FiCheckCircle size={16} />
                      Paid via: {split.paymentDetails.method}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {new Date(split.paymentDetails.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBillPayment;
