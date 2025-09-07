import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRegistrationForm = ({ onSuccess }) => {
  const { login, api } = useAuth(); // Use the api from your AuthContext
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
useEffect(() => {
  const checkAdminExists = async () => {
    try {
      const response = await api.get('/admin/admin-exists');
      setAdminExists(response.data.adminExists);
    } catch (error) {
      console.error('Error checking admin existence:', error);
      
      // Handle 401 (Unauthorized) and 404 (Not Found) errors
      if ([401, 404].includes(error.response?.status)) {
        // If we get 401/404, assume no admin exists yet
        setAdminExists(false);
        toast.info('No admin account found. You can create the first admin account.');
      } else {
        toast.error('Failed to check admin status. Please try again.');
      }
    } finally {
      setCheckingAdmin(false);
    }
  };

  checkAdminExists();
}, [api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate secret key
    if (formData.secretKey !== 'ADMIN_SETUP_2024') {
      toast.error('Invalid admin secret key');
      setLoading(false);
      return;
    }

    try {
      // ✅ Use the correct endpoint
      const response = await api.post('/admin/register-admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        secretKey: formData.secretKey
      });

      toast.success('Admin account created successfully!');
      
      // Log in the new admin
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // You might need to adjust this based on your login function
        await login(response.data.user.email, formData.password);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
      });

      // Notify parent component and update admin exists state
      setAdminExists(true);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Registration error:', error);
      
      // Show specific error messages
      if (error.response?.data?.status === 'admin_exists') {
        toast.error('Admin account already exists. Only one admin is allowed.');
        setAdminExists(true);
      } else if (error.response?.data?.status === 'invalid_secret') {
        toast.error('Invalid admin secret key.');
      } else if (error.response?.data?.status === 'user_exists') {
        toast.error('User already exists with this email.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to create admin account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Show message if admin already exists
  if (checkingAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <p className="text-center">Checking admin status...</p>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center text-green-600">Admin Account Exists</h3>
        <p className="text-gray-600 text-center">
          An admin account has already been created. Only one admin is allowed in the system.
        </p>
        <p className="text-sm text-gray-500 text-center mt-4">
          Please use the existing admin account to manage the system.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Initial Admin Setup</h3>
      <p className="text-gray-600 mb-4 text-center text-sm">
        Create the first and only admin account for your application
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter admin full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter admin email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password *</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Create a strong password"
            minLength="6"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Confirm your password"
            minLength="6"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Secret Key *</label>
          <input
            type="password"
            name="secretKey"
            required
            value={formData.secretKey}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter the admin setup key"
          />
          <p className="text-xs text-gray-500 mt-1">Hint: ADMIN_SETUP_2024</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  );
};


export default AdminRegistrationForm;
