import React, { useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';

const DEPARTMENTS = [
  { id: 1, name: 'laundry' },
  { id: 2, name: 'reception' },
  { id: 3, name: 'maintenance' },
  { id: 4, name: 'other' },
  { id: 5, name: 'housekeeping' }
];

const departmentOptions = DEPARTMENTS.map(dep => ({ value: dep, label: `${dep.name} (${dep.id})` }));

const Register = ({ onSuccess }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    department: [],
    restaurantRole: '',
    name: '',
    phoneNumber: '',
    validId: '',
    dateOfJoining: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: ''
    },
    salaryDetails: {
      basicSalary: '',
      allowances: '',
      deductions: '',
      netSalary: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (form.role === 'ADMIN') {
        payload.department = DEPARTMENTS;
      }
      if (form.role === 'STAFF' && Array.isArray(form.department)) {
        payload.department = form.department.map(dep => dep.value);
      }
      await axios.post('/api/users/add', payload);
      showToast.success('User registered successfully!');
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Username *</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
            placeholder="Enter email"
          />
        </div>


        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg px-3 py-2 pr-10"
              style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? '👁️' : '👁️🗨️'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Date of Joining</label>
          <input
            type="date"
            name="dateOfJoining"
            value={form.dateOfJoining}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Role *</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          >
            <option value="">Select role</option>
            <option value="ADMIN">Admin</option>
            <option value="GM">General Manager</option>
            <option value="FRONT DESK">Front Desk</option>
            <option value="ACCOUNTS">Accounts</option>
            <option value="STAFF">Staff</option>
            <option value="RESTAURANT">Restaurant</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Valid ID Type</label>
          <select
            name="validId"
            value={form.validId}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          >
            <option value="">Select ID type</option>
            <option value="aadhar">Aadhar</option>
            <option value="pan">PAN</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driving License</option>
            <option value="voter_id">Voter ID</option>
          </select>
        </div>

        {form.role === 'STAFF' && (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Department(s) *</label>
            <Select
              isMulti
              name="department"
              options={departmentOptions}
              value={form.department}
              onChange={selected => setForm(prev => ({
                ...prev,
                department: selected
              }))}
              className="basic-multi-select"
              classNamePrefix="select"
              required
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'white',
                  border: '1px solid hsl(45, 100%, 85%)',
                  borderRadius: '0.5rem',
                  padding: '0.125rem',
                  color: 'hsl(45, 100%, 20%)'
                })
              }}
            />
          </div>
        )}

        {form.role === 'RESTAURANT' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Restaurant Role *</label>
            <select
              name="restaurantRole"
              value={form.restaurantRole}
              onChange={handleChange}
              required
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
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold mb-3" style={{ color: 'hsl(45, 100%, 20%)' }}>Bank Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Account Number"
            value={form.bankDetails.accountNumber}
            onChange={(e) => setForm({...form, bankDetails: {...form.bankDetails, accountNumber: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
          <input
            type="text"
            placeholder="IFSC Code"
            value={form.bankDetails.ifscCode}
            onChange={(e) => setForm({...form, bankDetails: {...form.bankDetails, ifscCode: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
          <input
            type="text"
            placeholder="Bank Name"
            value={form.bankDetails.bankName}
            onChange={(e) => setForm({...form, bankDetails: {...form.bankDetails, bankName: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
          <input
            type="text"
            placeholder="Account Holder Name"
            value={form.bankDetails.accountHolderName}
            onChange={(e) => setForm({...form, bankDetails: {...form.bankDetails, accountHolderName: e.target.value}})}
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
            value={form.salaryDetails.basicSalary}
            onChange={(e) => setForm({...form, salaryDetails: {...form.salaryDetails, basicSalary: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
          <input
            type="number"
            placeholder="Allowances"
            value={form.salaryDetails.allowances}
            onChange={(e) => setForm({...form, salaryDetails: {...form.salaryDetails, allowances: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
          <input
            type="number"
            placeholder="Deductions"
            value={form.salaryDetails.deductions}
            onChange={(e) => setForm({...form, salaryDetails: {...form.salaryDetails, deductions: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
          <input
            type="number"
            placeholder="Net Salary"
            value={form.salaryDetails.netSalary}
            onChange={(e) => setForm({...form, salaryDetails: {...form.salaryDetails, netSalary: e.target.value}})}
            className="w-full rounded-lg px-3 py-2"
            style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: 'hsl(45, 71%, 69%)', color: 'hsl(45, 100%, 20%)' }}
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default Register;
