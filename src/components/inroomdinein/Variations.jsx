import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            ← Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Variations</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Variation
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Variation</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); setFormData({ name: '', price: 0 }); }} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variations.map(item => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-blue-600 font-semibold">₹{item.price}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditingItem(item); setFormData(item); setShowForm(true); }} className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(item._id)} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Variations;
