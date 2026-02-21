import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiUsers, FiDivideCircle } from 'react-icons/fi';

const SplitBill = ({ orderId, onClose, onSplitCreated }) => {
  const [order, setOrder] = useState(null);
  const [splitType, setSplitType] = useState('equal');
  const [numberOfSplits, setNumberOfSplits] = useState(2);
  const [customSplits, setCustomSplits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/get/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(data.order);
      initializeCustomSplits(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const initializeCustomSplits = (orderData) => {
    setCustomSplits([
      { customerName: 'Split 1', items: [] },
      { customerName: 'Split 2', items: [] }
    ]);
  };

  const handleEqualSplit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/split-bill/split-equally/${orderId}`,
        { numberOfSplits },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Bill split successfully!');
      if (onSplitCreated) onSplitCreated(data.splitBill);
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to split bill');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSplit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/split-bill/split/${orderId}`,
        { splits: customSplits },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Bill split successfully!');
      if (onSplitCreated) onSplitCreated(data.splitBill);
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to split bill');
    } finally {
      setLoading(false);
    }
  };

  const addItemToSplit = (splitIndex, item) => {
    const newSplits = [...customSplits];
    const existingItem = newSplits[splitIndex].items.find(i => i.menuId === item.menuId.toString());
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newSplits[splitIndex].items.push({
        menuId: item.menuId.toString(),
        quantity: 1
      });
    }
    setCustomSplits(newSplits);
  };

  const addSplit = () => {
    setCustomSplits([...customSplits, { customerName: `Split ${customSplits.length + 1}`, items: [] }]);
  };

  if (!order) return <div className="p-4">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-white/90 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-gray-900">💳 Split Bill - Order #{order.orderNumber}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">Items</p>
                <p className="text-xl font-semibold text-gray-900">{order.items.length + (order.extraItems?.length || 0)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setSplitType('equal')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  splitType === 'equal' 
                    ? 'bg-white/60 backdrop-blur-lg text-gray-900 shadow-lg border border-white/50' 
                    : 'bg-white/30 backdrop-blur-md text-gray-700 hover:bg-white/40 border border-white/30'
                }`}
              >
                <FiUsers size={20} />
                <span className="font-medium">Equal Split</span>
              </button>
              <button
                onClick={() => setSplitType('custom')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  splitType === 'custom' 
                    ? 'bg-white/60 backdrop-blur-lg text-gray-900 shadow-lg border border-white/50' 
                    : 'bg-white/30 backdrop-blur-md text-gray-700 hover:bg-white/40 border border-white/30'
                }`}
              >
                <FiDivideCircle size={20} />
                <span className="font-medium">Custom Split</span>
              </button>
            </div>

            {splitType === 'equal' ? (
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 border border-white/30">
                <label className="block text-sm font-medium text-gray-900 mb-3">Number of People:</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={numberOfSplits}
                  onChange={(e) => setNumberOfSplits(parseInt(e.target.value))}
                  className="w-full bg-white/40 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="mt-4 p-4 bg-green-50/50 backdrop-blur-md rounded-lg border border-green-200/30">
                  <p className="text-sm text-gray-700">Each person pays:</p>
                  <p className="text-2xl font-bold text-green-600">₹{(order.totalAmount / numberOfSplits).toFixed(2)}</p>
                </div>
                <button
                  onClick={handleEqualSplit}
                  disabled={loading}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all font-medium"
                >
                  {loading ? 'Processing...' : 'Split Equally'}
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {customSplits.map((split, index) => (
                    <div key={index} className="bg-white/30 backdrop-blur-md rounded-xl p-4 border border-white/30">
                      <input
                        type="text"
                        value={split.customerName}
                        onChange={(e) => {
                          const newSplits = [...customSplits];
                          newSplits[index].customerName = e.target.value;
                          setCustomSplits(newSplits);
                        }}
                        className="w-full bg-white/40 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 mb-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Customer name"
                      />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900 mb-2">Items: {split.items.length}</p>
                        {split.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-700 bg-white/30 rounded px-2 py-1 mb-1">
                            Qty: {item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addSplit} 
                  className="mb-4 w-full bg-white/30 backdrop-blur-md border border-white/30 text-gray-900 px-4 py-2 rounded-xl hover:bg-white/40 transition-all font-medium"
                >
                  + Add Another Split
                </button>

                <div className="mb-4 bg-white/30 backdrop-blur-md rounded-xl p-4 border border-white/30">
                  <h3 className="font-semibold text-gray-900 mb-3">Assign Items to Splits:</h3>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/40 backdrop-blur-md rounded-lg p-3 border border-white/30">
                        <span className="text-sm font-medium text-gray-900">{item.name} (Qty: {item.quantity})</span>
                        <div className="flex gap-2">
                          {customSplits.map((_, splitIdx) => (
                            <button
                              key={splitIdx}
                              onClick={() => addItemToSplit(splitIdx, item)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all shadow-md"
                            >
                              → Split {splitIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {order.extraItems && order.extraItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/30">
                        <p className="text-xs text-gray-600 mb-2 font-semibold">Extra Items:</p>
                        {order.extraItems.map((item, idx) => (
                          <div key={`extra-${idx}`} className="flex items-center justify-between bg-amber-50/40 backdrop-blur-md rounded-lg p-3 border border-amber-200/30 mb-2">
                            <span className="text-sm font-medium text-gray-900">{item.name} (Qty: {item.quantity}) - ₹{item.total}</span>
                            <span className="text-xs text-amber-600 font-semibold">Extra Item</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCustomSplit}
                  disabled={loading || customSplits.some(s => s.items.length === 0)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all font-medium"
                >
                  {loading ? 'Processing...' : 'Create Split Bill'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBill;
