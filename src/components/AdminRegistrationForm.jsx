import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRegistrationForm = ({ onSuccess }) => {
  const { login, api } = useAuth();
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
        console.log('Checking if admin exists...');
        const response = await api.get('/admin/admin-exists', {
          timeout: 10000 // 10 second timeout
        });
        setAdminExists(response.data.adminExists);
        console.log('Admin exists:', response.data.adminExists);
      } catch (error) {
        console.error('Error checking admin existence:', error);
        
        // Handle different error scenarios
        if (error.code === 'ECONNABORTED') {
          // Timeout error - backend is slow
          console.log('Backend timeout, assuming no admin exists');
          setAdminExists(false);
          toast.info('Backend is slow to respond. You can try creating an admin account.');
        } else if ([401, 404].includes(error.response?.status)) {
          // 401/404 errors - assume no admin exists
          console.log('401/404 error, assuming no admin exists');
          setAdminExists(false);
          toast.info('No admin account found. You can create the first admin account.');
        } else {
          // Other errors
          console.log('Other error, assuming no admin exists');
          setAdminExists(false);
          toast.error('Could not verify admin status. You can try creating an admin account.');
        }
      } finally {
        setCheckingAdmin(false);
      }
    };

    // Add a small delay before checking to avoid immediate errors
    const timer = setTimeout(() => {
      checkAdminExists();
    }, 1000);

    return () => clearTimeout(timer);
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
      console.log('Attempting to create admin account...');
      const response = await api.post('/admin/register-admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        secretKey: formData.secretKey
      }, {
        timeout: 30000 // 30 second timeout for registration
      });

      toast.success('Admin account created successfully!');
      
      // Log in the new admin
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Use the login function but don't await it to avoid blocking
        login(response.data.user.email, formData.password)
          .then(() => console.log('Admin logged in successfully'))
          .catch(err => console.error('Login error:', err));
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
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. The backend is taking too long to respond.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to create admin account. Please try again.');
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

  // Show message if admin already exists
  if (checkingAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Checking admin status...</p>
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
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Hint: ADMIN_SETUP_2024</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  );
};

export default AdminRegistrationForm;





// // // Create a new file: AdminRegistrationSimple.jsx
// // import { useState } from 'react';
// // import { useAuth } from '../context/AuthContext';
// // import { toast } from 'react-toastify';

// // const  export default AdminRegistrationForm = ({ onSuccess }) => {
// //   const { api } = useAuth();
// //   const [formData, setFormData] = useState({
// //     name: '', email: '', password: '', confirmPassword: '', secretKey: ''
// //   });
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     if (formData.password !== formData.confirmPassword) {
// //       toast.error('Passwords do not match');
// //       setLoading(false);
// //       return;
// //     }

// //     if (formData.secretKey !== 'ADMIN_SETUP_2024') {
// //       toast.error('Invalid admin secret key');
// //       setLoading(false);
// //       return;
// //     }

// //     try {
// //       const response = await api.post('/admin/register-admin', {
// //         name: formData.name,
// //         email: formData.email,
// //         password: formData.password,
// //         secretKey: formData.secretKey
// //       }, { timeout: 30000 });

// //       toast.success('Admin account created successfully!');
      
// //       if (response.data.token) {
// //         localStorage.setItem('token', response.data.token);
// //       }
      
// //       setFormData({ name: '', email: '', password: '', confirmPassword: '', secretKey: '' });
// //       if (onSuccess) onSuccess();

// //     } catch (error) {
// //       console.error('Registration error:', error);
// //       toast.error(error.response?.data?.error || 'Failed to create admin account');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   return (
// //     <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
// //       <h3 className="text-xl font-bold mb-4 text-center">Admin Setup</h3>
      
// //       <form onSubmit={handleSubmit} className="space-y-4">
// //         {/* Your form fields here */}
// //         <button type="submit" disabled={loading}>
// //           {loading ? 'Creating...' : 'Create Admin Account'}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default  export default AdminRegistrationForm;;

// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// const AdminRegistrationForm = ({ onSuccess }) => {
//   const { api, user, isAdmin, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: '', email: '', password: '', confirmPassword: '', secretKey: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [isChecking, setIsChecking] = useState(true);

//   // Redirect if user is already admin
//   useEffect(() => {
//     if (!authLoading) {
//       if (user && isAdmin()) {
//         // User is already an admin, redirect to dashboard
//         toast.info('You are already an administrator. Redirecting to dashboard...');
//         navigate('/dashboard');
//       } else {
//         setIsChecking(false);
//       }
//     }
//   }, [user, isAdmin, authLoading, navigate]);

//   // Show loading while checking auth status
//   if (authLoading || isChecking) {
//     return (
//       <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Checking authentication status...</p>
//         </div>
//       </div>
//     );
//   }

//   // If user is logged in but not admin, show message
//   if (user && !isAdmin()) {
//     return (
//       <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
//         <h3 className="text-xl font-bold mb-4 text-center text-red-600">Access Denied</h3>
//         <p className="text-gray-600 text-center mb-4">
//           You are logged in as a {user.role}, but admin access is required to create new admin accounts.
//         </p>
//         <div className="text-center">
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     if (formData.secretKey !== 'ADMIN_SETUP_2024') {
//       toast.error('Invalid admin secret key');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await api.post('/admin/register-admin', {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         secretKey: formData.secretKey
//       }, { timeout: 30000 });

//       toast.success('Admin account created successfully!');
      
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         // Force page reload to update auth state
//         window.location.reload();
//       }
      
//       setFormData({ name: '', email: '', password: '', confirmPassword: '', secretKey: '' });
      
//       if (onSuccess) onSuccess();

//     } catch (error) {
//       console.error('Registration error:', error);
      
//       // Handle specific error cases
//       if (error.response?.data?.status === 'admin_exists') {
//         toast.error('Admin account already exists. Only one admin is allowed.');
//       } else if (error.response?.data?.status === 'user_exists') {
//         toast.error('User already exists with this email.');
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to create admin account. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
//       <h3 className="text-xl font-bold mb-4 text-center">Initial Admin Setup</h3>
//       <p className="text-gray-600 mb-4 text-center text-sm">
//         Create the first and only admin account for your application
//       </p>
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Full Name *</label>
//           <input
//             type="text"
//             name="name"
//             required
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             placeholder="Enter admin full name"
//             disabled={loading}
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Email *</label>
//           <input
//             type="email"
//             name="email"
//             required
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             placeholder="Enter admin email address"
//             disabled={loading}
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Password *</label>
//           <input
//             type="password"
//             name="password"
//             required
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             placeholder="Create a strong password"
//             minLength="6"
//             disabled={loading}
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
//           <input
//             type="password"
//             name="confirmPassword"
//             required
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             placeholder="Confirm your password"
//             minLength="6"
//             disabled={loading}
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Admin Secret Key *</label>
//           <input
//             type="password"
//             name="secretKey"
//             required
//             value={formData.secretKey}
//             onChange={handleChange}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             placeholder="Enter the admin setup key"
//             disabled={loading}
//           />
//           <p className="text-xs text-gray-500 mt-1">Hint: ADMIN_SETUP_2024</p>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AdminRegistrationForm;

