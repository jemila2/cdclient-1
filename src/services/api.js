
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-21-2fu1.onrender.com';

import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error Details:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        requestHeaders: error.config.headers
      });
      
      if (error.response.status === 400) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
    return Promise.reject(error);
  }
);

// Customer API
export const customerApi = {
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  }
};

// Order API
export const orderApi = {
  getSummary: async (employeeId = null) => {
    const params = employeeId ? { employeeId } : {};
    const response = await api.get('/orders/summary', { params });
    return response.data;
  },

  getAll: async (filters = {}) => {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  },

  getCustomerOrders: async (customerId) => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  },

  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  complete: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/complete`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  }
};

// Employee API
export const employeeApi = {
  getTasks: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/tasks`);
    return response.data;
  },

  getStats: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/stats`);
    return response.data;
  }
};

// User API
export const userApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  updateRole: async (userId, newRole) => {
    const response = await api.patch(`/users/${userId}/role`, { role: newRole });
    return response.data;
  }
};

// Supply API
export const supplyApi = {
  request: async (employeeId) => {
    const response = await api.post('/supplies', { employeeId });
    return response.data;
  }
};

// Task API
export const taskApi = {
  updateStatus: async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  getEmployeeTasks: async (employeeId) => {
    const response = await api.get(`/tasks/employee/${employeeId}`);
    return response.data;
  }
};




// Add this function if it's missing
export const getCustomers = async (params = {}) => {
  try {
    const response = await api.get('/customers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Make sure you're exporting all functions
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Add other API functions you need
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};


export default api;



