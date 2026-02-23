import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import Pagination from "../common/Pagination";
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiTag } from 'react-icons/fi';

const Menu = () => {
  const { axios } = useAppContext();
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    Price: 0,
    category: '',
    status: 'available',
    in_oostock: true,
    image: '',
    description: '',
    timeToPrepare: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/items/all');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingItem) {
        await axios.put(`/api/items/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/items/add', formData);
      }
      fetchMenuItems();
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', Price: 0, category: '', status: 'available', in_oostock: true, image: '', description: '', timeToPrepare: 0 });
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen" style={{ backgroundColor: '#1f2937' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Menu Items</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto transition-colors hover:opacity-90"
          style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}
        >
          <FiPlus /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="p-4 sm:p-6 rounded-lg shadow-xl mb-6" style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}>
          <h3 className="text-lg font-semibold mb-4 text-white">{editingItem ? 'Edit' : 'Add'} Menu Item</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Item Name *</label>
              <input
                type="text"
                placeholder="Enter item name"
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
                placeholder="Enter price"
                value={formData.Price}
                onChange={(e) => setFormData({...formData, Price: Math.max(0, Number(e.target.value))})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Category *</label>
              <input
                type="text"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Time to Prepare (minutes)</label>
              <input
                type="number"
                placeholder="Enter preparation time"
                value={formData.timeToPrepare}
                onChange={(e) => setFormData({...formData, timeToPrepare: Number(e.target.value)})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
                min="0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
              <textarea
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-lg px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:border-[#c2ab65] focus:outline-none"
                rows="3"
              />
            </div>
            <div className="col-span-2 flex space-x-2">
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({ name: '', Price: 0, category: '', status: 'available', in_oostock: true, image: '', description: '', timeToPrepare: 0 });
                }}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
          <div key={item._id} className="p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}>
            <h3 className="font-semibold text-lg text-white mb-2">{item.name}</h3>
            {item.description && <p className="text-sm mb-3 text-gray-300">{item.description}</p>}
            <p className="font-bold text-xl mb-3" style={{ color: '#c2ab65' }}>₹{item.Price}</p>
            <div className="flex items-center gap-2 mb-2">
              <FiTag className="text-gray-400" />
              <p className="text-sm text-gray-300">{item.category}</p>
            </div>
            {item.timeToPrepare > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <FiClock className="text-gray-400" />
                <p className="text-sm text-gray-300">{item.timeToPrepare} min</p>
              </div>
            )}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-600">
              <span className={`text-sm font-medium ${item.in_oostock ? 'text-green-400' : 'text-red-400'}`}>
                {item.in_oostock ? 'In Stock' : 'Out of Stock'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.status === 'available'}
                  onChange={async (e) => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.put(`/api/items/${item._id}`, {
                        ...item,
                        status: e.target.checked ? 'available' : 'unavailable'
                      }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      fetchMenuItems();
                    } catch (error) {
                      console.error('Error updating item status:', error);
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  item.status === 'available' ? 'bg-[#c2ab65]' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    item.status === 'available' ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm flex-1 transition-colors hover:opacity-90"
                style={{ backgroundColor: '#c2ab65', color: '#1f2937' }}
              >
                <FiEdit2 /> Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm flex-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(menuItems.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={menuItems.length}
      />
    </div>
  );
};

export default Menu;
