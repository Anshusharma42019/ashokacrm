import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md" style={{ backgroundColor: '#374151', color: '#d1d5db' }}>
            <FiArrowLeft /> Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Addons</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto transition-colors hover:opacity-90 shadow-md" style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}>
          <FiPlus /> Add Addon
        </button>
      </div>

      {showForm && (
        <div className="p-4 sm:p-6 rounded-lg shadow-xl mb-6" style={{ backgroundColor: '#374151' }}>
          <h3 className="text-lg font-semibold mb-4 text-white">{editingItem ? 'Edit' : 'Add'} Addon</h3>
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
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
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
                <span className="text-sm font-medium text-gray-300">Vegetarian</span>
              </label>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}>
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); setFormData({ name: '', price: 0, description: '', veg: true }); }} className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">No addons found. Add some addons to get started.</p>
          </div>
        ) : (
          addons.map(item => (
            <div key={item._id} className="p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundColor: '#374151' }}>
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${item.veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {item.veg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
              {item.description && <p className="text-sm text-gray-300 mt-1">{item.description}</p>}
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

export default Addons;
