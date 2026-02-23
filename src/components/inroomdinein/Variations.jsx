import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Variations = ({ onBack }) => {
  const { axios } = useAppContext();
  const [variations, setVariations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: 0 });

  const fetchVariations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/variations/all/variation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVariations(response.data || []);
    } catch (error) {
      console.error('Error fetching variations:', error);
    }
  };

  useEffect(() => {
    fetchVariations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingItem) {
        await axios.put(`/api/variations/update/variation/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/variations/add/variation', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchVariations();
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', price: 0 });
    } catch (error) {
      console.error('Error saving variation:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/variations/delete/variation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVariations();
    } catch (error) {
      console.error('Error deleting variation:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md" style={{ backgroundColor: '#374151', color: '#d1d5db' }}>
            <FiArrowLeft /> Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Variations</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto transition-colors hover:opacity-90 shadow-md" style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}>
          <FiPlus /> Add Variation
        </button>
      </div>

      {showForm && (
        <div className="p-4 sm:p-6 rounded-lg shadow-xl mb-6" style={{ backgroundColor: '#374151' }}>
          <h3 className="text-lg font-semibold mb-4 text-white">{editingItem ? 'Edit' : 'Add'} Variation</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}>
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); setFormData({ name: '', price: 0 }); }} className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variations.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">No variations found. Add some variations to get started.</p>
          </div>
        ) : (
          variations.map(item => (
            <div key={item._id} className="p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundColor: '#374151' }}>
              <h3 className="font-semibold text-lg text-white">{item.name}</h3>
              <p className="font-bold text-xl mt-2" style={{ color: '#c2ab65' }}>₹{item.price}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setEditingItem(item); setFormData(item); setShowForm(true); }} className="flex items-center gap-2 px-3 py-2 rounded text-sm flex-1 transition-colors hover:opacity-90" style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}>
                  <FiEdit2 /> Edit
                </button>
                <button onClick={() => handleDelete(item._id)} className="flex items-center gap-2 px-3 py-2 rounded text-sm flex-1 bg-red-600 text-white hover:bg-red-700 transition-colors">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Variations;
