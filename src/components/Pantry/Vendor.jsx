import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Plus, Edit, Trash2, BarChart3, X } from 'lucide-react';
import DashboardLoader from '../DashboardLoader';

const Vendor = () => {
  const { axios } = useAppContext();
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showVendorAnalytics, setShowVendorAnalytics] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);

  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    UpiID: '',
    scannerImg: '',
    isActive: true
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendorsData = Array.isArray(response.data) ? response.data : (response.data.vendors || []);
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      showToast.error('Failed to fetch vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/pantry/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const ordersData = data.orders || data.data || data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    fetchVendors();
    fetchOrders();
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <DashboardLoader pageName="Pantry Vendors" />;
  }

  const handleVendorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVendorFormData(prev => ({
          ...prev,
          scannerImg: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingVendor) {
        await axios.put(`/api/vendor/update/${editingVendor._id}`, vendorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast.success('Vendor updated successfully!');
      } else {
        await axios.post('/api/vendor/add', vendorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast.success('Vendor added successfully!');
      }
      resetVendorForm();
      fetchVendors();
    } catch (err) {
      showToast.error(editingVendor ? 'Failed to update vendor' : 'Failed to add vendor');
    } finally {
      setLoading(false);
    }
  };

  const resetVendorForm = () => {
    setVendorFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      UpiID: '',
      scannerImg: '',
      isActive: true
    });
    setSelectedImage(null);
    setEditingVendor(null);
    setShowVendorForm(false);
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorFormData({
      name: vendor.name || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      gstNumber: vendor.gstNumber || '',
      UpiID: vendor.UpiID || '',
      scannerImg: vendor.scannerImg || '',
      isActive: vendor.isActive !== undefined ? vendor.isActive : true
    });
    setShowVendorForm(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vendor/delete/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Vendor deleted successfully!');
      fetchVendors();
    } catch (err) {
      showToast.error('Failed to delete vendor');
    }
  };

  const getVendorAnalytics = () => {
    const analytics = {};
    
    orders.forEach(order => {
      if (order.vendorId && order.totalAmount) {
        const vendorId = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
        const vendor = vendors.find(v => v._id === vendorId);
        const vendorName = vendor?.name || 'Unknown Vendor';
        
        if (!analytics[vendorId]) {
          analytics[vendorId] = {
            name: vendorName,
            totalOrders: 0,
            totalAmount: 0,
            avgAmount: 0,
            lastOrderDate: null,
            orders: []
          };
        }
        
        analytics[vendorId].totalOrders++;
        analytics[vendorId].totalAmount += order.totalAmount;
        analytics[vendorId].orders.push({
          date: order.createdAt || order.orderDate,
          amount: order.totalAmount,
          orderNumber: order.orderNumber
        });
        
        if (!analytics[vendorId].lastOrderDate || new Date(order.createdAt) > new Date(analytics[vendorId].lastOrderDate)) {
          analytics[vendorId].lastOrderDate = order.createdAt;
        }
      }
    });
    
    // Calculate averages
    Object.keys(analytics).forEach(vendorId => {
      analytics[vendorId].avgAmount = analytics[vendorId].totalAmount / analytics[vendorId].totalOrders;
      analytics[vendorId].orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return Object.values(analytics).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="p-4 sm:p-6 overflow-auto h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">Vendor Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* <button
            onClick={() => setShowVendorAnalytics(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Vendor Analytics
          </button> */}
          <button
            onClick={() => setShowVendorForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base flex items-center gap-2"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No vendors found</td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.contactPerson || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.UpiID || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.gstNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button onClick={resetVendorForm} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  name="name"
                  value={vendorFormData.name}
                  onChange={handleVendorChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={vendorFormData.contactPerson}
                  onChange={handleVendorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={vendorFormData.phone}
                  onChange={handleVendorChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={vendorFormData.email}
                  onChange={handleVendorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={vendorFormData.address}
                  onChange={handleVendorChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={vendorFormData.gstNumber}
                  onChange={handleVendorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  name="UpiID"
                  value={vendorFormData.UpiID || ''}
                  onChange={handleVendorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {vendorFormData.scannerImg && (
                  <img src={vendorFormData.scannerImg} alt="QR Code" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={vendorFormData.isActive}
                  onChange={handleVendorChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetVendorForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingVendor ? 'Update' : 'Add'} Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Analytics Modal */}
      {showVendorAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Vendor Analytics</h2>
              <button onClick={() => setShowVendorAnalytics(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              {getVendorAnalytics().map((vendor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{vendor.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <div className="font-semibold">{vendor.totalOrders}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <div className="font-semibold">₹{vendor.totalAmount.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Amount:</span>
                      <div className="font-semibold">₹{vendor.avgAmount.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Order:</span>
                      <div className="font-semibold">
                        {vendor.lastOrderDate ? new Date(vendor.lastOrderDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
