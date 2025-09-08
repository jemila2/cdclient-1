// // import React from 'react' 
// // import ReactDOM from 'react-dom/client' 
// // import App from './App' 
// // import './index.css' 
 
// // ReactDOM.createRoot(document.getElementById('root')).render( 
// //   <React.StrictMode> 
// //     <App /> 
// //   </React.StrictMode> 
// // ) 


// // // REACT_APP_API_URL=https://backend-21-2fu1.onrender.com

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import './index.css'

// try {
//   console.log('Attempting to render React app...')
  
//   const rootElement = document.getElementById('root')
//   if (!rootElement) {
//     throw new Error('Root element not found!')
//   }
  
//   const root = ReactDOM.createRoot(rootElement)
  
//   root.render(
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>
//   )
  
//   console.log('React app rendered successfully')
// } catch (error) {
//   console.error('Failed to render React app:', error)
//   document.body.innerHTML = `
//     <div style="padding: 20px; color: red;">
//       <h1>Error Loading App</h1>
//       <p>${error.message}</p>
//       <p>Check console for details</p>
//     </div>
//   `

// }



// // TEMPORARY FIX - Add this at the VERY TOP of your React entry file
// if (typeof import.meta === 'undefined') {
//   window.import = { meta: { env: {} } };
// }
// if (typeof import.meta.env.VITE_API_BASE_URL === 'undefined') {
//   import.meta.env.VITE_API_BASE_URL = 'https://backend-21-2fu1.onrender.com';
// }

// // Your existing React imports
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );


// TEMPORARY FIX - Add this at the VERY TOP of your React entry file
if (typeof import.meta === 'undefined') {
  window.import = { meta: { env: {} } };
}
if (typeof import.meta.env.VITE_API_BASE_URL === 'undefined') {
  import.meta.env.VITE_API_BASE_URL = 'https://backend-21-2fu1.onrender.com';
}

// Your existing React imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

try {
  console.log('Attempting to render React app...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Error Loading App</h1>
      <p>${error.message}</p>
      <p>Check console for details</p>
    </div>
  `;
}
