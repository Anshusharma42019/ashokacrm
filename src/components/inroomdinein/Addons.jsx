import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const Addons = ({ onBack }) => {
  const { axios } = useAppContext();
  const [addons, setAddons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: 0, description: '', veg: true });

  const fetchAddons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/addons/all/addon', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddons(response.data || []);
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingItem) {
        await axios.put(`/api/addons/update/addon/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/addons/add/addon', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchAddons();
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', price: 0, description: '', veg: true });
    } catch (error) {
      console.error('Error saving addon:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/addons/delete/addon/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAddons();
    } catch (error) {
      console.error('Error deleting addon:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            ← Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Addons</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Addon
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} Addon</h3>
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
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.veg}
                  onChange={(e) => setFormData({...formData, veg: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm font-medium">Vegetarian</span>
              </label>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); setFormData({ name: '', price: 0, description: '', veg: true }); }} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map(item => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${item.veg ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {item.veg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>
            {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
            <p className="text-blue-600 font-semibold mt-2">₹{item.price}</p>
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

export default Addons;
