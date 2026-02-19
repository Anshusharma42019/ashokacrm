import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toaster';
import Pagination from '../common/Pagination';
import RegisterForm from '../auth/RegisterForm';
import DashboardLoader from '../DashboardLoader';

// Add CSS animations
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeInUp { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
  .animate-slideInLeft { opacity: 0; animation: slideInLeft 0.4s ease-out forwards; }
  .animate-scaleIn { opacity: 0; animation: scaleIn 0.3s ease-out forwards; }
  .animate-delay-100 { animation-delay: 0.1s; }
  .animate-delay-200 { animation-delay: 0.2s; }
  .animate-delay-300 { animation-delay: 0.3s; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const Users = () => {
  const { axios } = useAppContext();
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDetails, setShowDetails] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [showRegister, setShowRegister] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      if (currentPage === 1) {
        setIsInitialLoading(true);
      }
      await fetchUsers(currentPage);
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/all');
      
      console.log('API Response:', response.data);
      console.log('First user:', response.data.users?.[0]);
      
      const usersData = response.data.users || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setTotalPages(Math.ceil(usersData.length / itemsPerPage));
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast.error('Failed to fetch users');
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = users.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'restaurant': return 'bg-yellow-100 text-yellow-800';
      case 'pantry': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    // Update UI immediately
    const newStatus = currentStatus === false ? true : false;
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId 
          ? { ...user, isActive: newStatus }
          : user
      )
    );
    setFilteredUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId 
          ? { ...user, isActive: newStatus }
          : user
      )
    );
    
    try {
      const response = await axios.patch(`/api/users/toggle-status/${userId}`);
      showToast.success('User status updated successfully!');
      
      // If user was deactivated, broadcast to force logout
      if (newStatus === false) {
        // For cross-tab logout
        localStorage.setItem('forceLogout', JSON.stringify({ userId, timestamp: Date.now() }));
        localStorage.removeItem('forceLogout');
        
        // For same-tab logout
        window.dispatchEvent(new CustomEvent('forceLogout', { detail: { userId } }));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast.error('Failed to update user status');
      
      // Revert the change on error
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: currentStatus }
            : user
        )
      );
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: currentStatus }
            : user
        )
      );
    }
  };

  const viewUserDetails = (user) => {
    console.log('Restaurant Details:', user.restaurantRole);
    console.log('Full User Object:', user);
    setShowDetails(user);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/update/${editUser._id}`, editUser);
      showToast.success('User updated successfully!');
      setShowEdit(false);
      fetchUsers(currentPage);
    } catch (error) {
      console.error('Error updating user:', error);
      showToast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/delete/${userId}`);
        showToast.success('User deleted successfully!');
        fetchUsers(currentPage);
      } catch (error) {
        console.error('Error deleting user:', error);
        showToast.error('Failed to delete user');
      }
    }
  };

  if (isInitialLoading) {
    return <DashboardLoader pageName="User Management" />;
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 animate-slideInLeft animate-delay-100">
          <h1 className="text-3xl font-bold text-text">All Users</h1>
          <button
            onClick={() => setShowRegister(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New User
          </button>
        </div>
        

        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeInUp animate-delay-200">
          <div className="p-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, username, email, or role..."
                  className="flex-1 p-2 border border-border rounded bg-white text-text focus:border-primary focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  className="bg-primary text-text px-4 py-2 rounded hover:bg-hover transition-colors whitespace-nowrap text-sm"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Username</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Restaurant Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Department</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    console.log('User row:', user.username, 'Role:', user.role, 'RestaurantRole:', user.restaurantRole, 'Department:', user.department);
                    return (
                    <tr key={user._id} className={`${index % 2 === 0 ? 'bg-background' : 'bg-white'} animate-scaleIn`} style={{animationDelay: `${Math.min(index * 50 + 300, 800)}ms`}}>
                      <td className="px-4 py-3 text-sm text-text font-medium">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-text">{user.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-text">{user.email || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text">
                        {user.role === 'RESTAURANT' && user.restaurantRole ? user.restaurantRole : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text">
                        {user.role === 'STAFF' && Array.isArray(user.department) && user.department.length > 0
                          ? user.department.map(dept => dept.name || dept).join(', ')
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.isActive !== false}
                            onChange={() => handleStatusToggle(user._id, user.isActive)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          <span className={`ml-3 text-sm font-medium ${user.isActive !== false ? 'text-green-600' : 'text-gray-500'}`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Edit
                          </button>
                          {hasRole('ADMIN') && (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalUsers}
            />
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">👤 User Details</h3>
                  <p className="text-blue-100 text-sm">{showDetails.username}</p>
                </div>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <p className="text-gray-800 font-semibold">{showDetails.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-800">{showDetails.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{showDetails.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${getRoleColor(showDetails.role)}`}>
                    {showDetails.role}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Department</label>
                  <p className="text-gray-800">
                    {Array.isArray(showDetails.department) 
                      ? showDetails.department.map(dept => typeof dept === 'object' ? dept.name : dept).join(', ')
                      : (typeof showDetails.department === 'object' ? showDetails.department.name : showDetails.department) || 'Not assigned'
                    }
                  </p>
                </div>
                
                {showDetails.restaurantRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Restaurant Role</label>
                    <p className="text-gray-800">{showDetails.restaurantRole}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(showDetails.isActive !== false)}`}>
                    {showDetails.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {showDetails.bankDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Bank Details</label>
                    <div className="text-gray-800 text-sm space-y-1">
                      <p><strong>Account:</strong> {showDetails.bankDetails.accountNumber || 'N/A'}</p>
                      <p><strong>IFSC:</strong> {showDetails.bankDetails.ifscCode || 'N/A'}</p>
                      <p><strong>Bank:</strong> {showDetails.bankDetails.bankName || 'N/A'}</p>
                      <p><strong>Holder:</strong> {showDetails.bankDetails.accountHolderName || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {showDetails.salaryDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Salary Details</label>
                    <div className="text-gray-800 text-sm space-y-1">
                      <p><strong>Basic:</strong> ₹{showDetails.salaryDetails.basicSalary || 0}</p>
                      <p><strong>Allowances:</strong> ₹{showDetails.salaryDetails.allowances || 0}</p>
                      <p><strong>Deductions:</strong> ₹{showDetails.salaryDetails.deductions || 0}</p>
                      <p><strong>Net Salary:</strong> ₹{showDetails.salaryDetails.netSalary || 0}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-800">
                    {showDetails.createdAt 
                      ? new Date(showDetails.createdAt).toLocaleDateString() 
                      : 'Not available'
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>Edit User</h3>
                <button
                  onClick={() => setShowEdit(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Username *</label>
                  <input
                    type="text"
                    value={editUser.username || ''}
                    onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Full Name</label>
                  <input
                    type="text"
                    value={editUser.name || ''}
                    onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Email</label>
                  <input
                    type="email"
                    value={editUser.email || ''}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Role *</label>
                  <select
                    value={editUser.role || ''}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="GM">General Manager</option>
                    <option value="FRONT DESK">Front Desk</option>
                    <option value="ACCOUNTS">Accounts</option>
                    <option value="STAFF">Staff</option>
                    <option value="RESTAURANT">Restaurant</option>
                  </select>
                </div>
                
                {editUser.role === 'RESTAURANT' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Restaurant Role</label>
                    <select
                      value={editUser.restaurantRole || ''}
                      onChange={(e) => setEditUser({...editUser, restaurantRole: e.target.value})}
                      className="w-full rounded-lg px-3 py-2"
                      style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                    >
                      <option value="">Select restaurant role</option>
                      <option value="staff">Staff</option>
                      <option value="cashier">Cashier</option>
                      <option value="chef">Chef</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>New Password</label>
                  <input
                    type="password"
                    value={editUser.password || ''}
                    onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Status</label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={editUser.isActive !== false}
                        onChange={() => setEditUser({...editUser, isActive: true})}
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">Active</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={editUser.isActive === false}
                        onChange={() => setEditUser({...editUser, isActive: false})}
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3" style={{ color: 'hsl(45, 100%, 20%)' }}>Bank Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={editUser.bankDetails?.accountNumber || ''}
                    onChange={(e) => setEditUser({...editUser, bankDetails: {...editUser.bankDetails, accountNumber: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={editUser.bankDetails?.ifscCode || ''}
                    onChange={(e) => setEditUser({...editUser, bankDetails: {...editUser.bankDetails, ifscCode: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={editUser.bankDetails?.bankName || ''}
                    onChange={(e) => setEditUser({...editUser, bankDetails: {...editUser.bankDetails, bankName: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={editUser.bankDetails?.accountHolderName || ''}
                    onChange={(e) => setEditUser({...editUser, bankDetails: {...editUser.bankDetails, accountHolderName: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3" style={{ color: 'hsl(45, 100%, 20%)' }}>Salary Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Basic Salary"
                    value={editUser.salaryDetails?.basicSalary || ''}
                    onChange={(e) => setEditUser({...editUser, salaryDetails: {...editUser.salaryDetails, basicSalary: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                  <input
                    type="number"
                    placeholder="Allowances"
                    value={editUser.salaryDetails?.allowances || ''}
                    onChange={(e) => setEditUser({...editUser, salaryDetails: {...editUser.salaryDetails, allowances: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                  <input
                    type="number"
                    placeholder="Deductions"
                    value={editUser.salaryDetails?.deductions || ''}
                    onChange={(e) => setEditUser({...editUser, salaryDetails: {...editUser.salaryDetails, deductions: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                  <input
                    type="number"
                    placeholder="Net Salary"
                    value={editUser.salaryDetails?.netSalary || ''}
                    onChange={(e) => setEditUser({...editUser, salaryDetails: {...editUser.salaryDetails, netSalary: e.target.value}})}
                    className="w-full rounded-lg px-3 py-2"
                    style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'hsl(45, 32%, 46%)', color: 'white' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'hsl(45, 71%, 69%)', color: 'hsl(45, 100%, 20%)' }}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: 'hsl(45, 100%, 20%)' }}>Add New User</h3>
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <RegisterForm onSuccess={() => { setShowRegister(false); fetchUsers(currentPage); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
