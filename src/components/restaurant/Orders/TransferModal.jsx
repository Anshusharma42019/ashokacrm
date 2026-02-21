import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiArrowRight, FiCheck } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TransferModal = ({ order, onClose, onSuccess }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [oldTableStatus, setOldTableStatus] = useState('available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableTables();
  }, []);

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/restaurant/tables/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tablesData = Array.isArray(response.data) ? response.data : response.data.tables || [];
      const availableTables = tablesData.filter(t => 
        t.status?.toLowerCase() === 'available' && 
        t.tableNumber !== order.tableNumber
      );
      setTables(availableTables);
    } catch (error) {
      console.error('Fetch tables error:', error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const selectedTableData = tables.find(t => t._id === selectedTable);
      await axios.patch(
        `${API_BASE_URL}/api/restaurant-orders/${order._id}/transfer-table`,
        { 
          newTableNo: selectedTableData?.tableNumber,
          oldTableStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to transfer table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f2937] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Transfer Order to New Table</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Order Number</p>
                <p className="font-semibold text-white">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Current Table</p>
                <p className="font-semibold text-[#c2ab65]">{order.tableNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Customer</p>
                <p className="font-semibold text-white">{order.customerName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-[#c2ab65] mb-6">
            <FiArrowRight size={24} />
            <span className="ml-2 text-sm font-medium">Select New Table</span>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No available tables found</p>
            </div>
          ) : (
            <form onSubmit={handleTransfer}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {tables.map((table) => (
                  <div
                    key={table._id}
                    onClick={() => setSelectedTable(table._id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                      selectedTable === table._id
                        ? 'bg-[#c2ab65] shadow-lg border-2 border-[#c2ab65]'
                        : 'bg-gray-800 hover:bg-gray-700 border-2 border-gray-700'
                    }`}
                  >
                    {selectedTable === table._id && (
                      <div className="absolute top-2 right-2 bg-white text-[#c2ab65] rounded-full p-1">
                        <FiCheck size={14} />
                      </div>
                    )}
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${
                        selectedTable === table._id ? 'text-white' : 'text-white'
                      }`}>
                        {table.tableNumber}
                      </div>
                      <div className={`text-xs mb-1 ${
                        selectedTable === table._id ? 'text-gray-100' : 'text-gray-400'
                      }`}>
                        {table.location}
                      </div>
                      <div className={`text-xs ${
                        selectedTable === table._id ? 'text-gray-100' : 'text-gray-400'
                      }`}>
                        Capacity: {table.capacity}
                      </div>
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Old Table Status
                </label>
                <select
                  value={oldTableStatus}
                  onChange={(e) => setOldTableStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c2ab65] text-white"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 text-white transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTable}
                  className="flex-1 px-6 py-3 bg-[#c2ab65] text-white rounded-xl hover:bg-[#b39a54] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all font-medium"
                >
                  {loading ? 'Transferring...' : 'Transfer to Selected Table'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
