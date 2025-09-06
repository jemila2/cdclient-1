import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRegistrationForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-21-2fu1.onrender.com';
        const response = await fetch(`${API_BASE_URL}/admin/admins/count`);
        
        if (response.ok) {
          const data = await response.json();
          setAdminExists(data.count > 0);
        } else {
          setAdminExists(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminExists(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  const apiRequest = async (endpoint, options = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-21-2fu1.onrender.com';
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const defaultConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const config = {
      ...defaultConfig,
      ...options,
      headers: {
        ...defaultConfig.headers,
        ...options.headers,
      },
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        let errorData;
        
        try {
          errorData = isJson ? await response.json() : { message: await response.text() };
        } catch (parseError) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Request failed with status ${response.status}`
        );
      }
      
      if (isJson) {
        return await response.json();
      } else {
        return await response.text();
      }
      
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server');
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.secretKey !== 'ADMIN_SETUP_2024') {
      toast.error('Invalid admin secret key');
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/admin/register-admin', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          secretKey: formData.secretKey
        }
      });

      toast.success('Admin account created successfully!');
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        login(response.user);
      }
      
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create admin account');
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

  if (checkingAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center text-green-600">Admin Already Exists</h3>
        <p className="text-gray-600 text-center">
          An admin account has already been created. Please use the login page to access the system.
        </p>
        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Go to Login Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Admin Registration</h3>
      <p className="text-gray-600 mb-4 text-center text-sm">
        Create the first admin account for your application
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
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
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
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
          <label className="block text-sm font-medium text-gray-700">Admin Secret Key</label>
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