// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import TransferPage from './pages/TransferPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import AuthProvider and useAuth
import { CircularProgress, Box } from '@mui/material'; // For loading indicator

// A PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useAuth(); // Get authentication status and loading state

  // If authentication status is still being determined, show a loading indicator
  if (loadingAuth) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
    );
  }

  // If not authenticated (and loading is done), redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // 'replace' prevents going back to the protected route
  }

  // If authenticated, render the children (the protected component)
  return children;
};

function App() {
  return (
      <Router>
        <AuthProvider> {/* Wrap the entire application with AuthProvider */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes - wrapped with PrivateRoute */}
            <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
            />
            <Route
                path="/deposit"
                element={
                  <PrivateRoute>
                    <DepositPage />
                  </PrivateRoute>
                }
            />
            <Route
                path="/withdraw"
                element={
                  <PrivateRoute>
                    <WithdrawPage />
                  </PrivateRoute>
                }
            />
            <Route
                path="/transfer"
                element={
                  <PrivateRoute>
                    <TransferPage />
                  </PrivateRoute>
                }
            />
            <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <TransactionHistoryPage />
                  </PrivateRoute>
                }
            />

            {/* Default Route: Redirect to dashboard if authenticated, else to login */}
            <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Navigate to="/dashboard" replace />
                  </PrivateRoute>
                }
            />
          </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;







// import logo from './logo.svg';
// import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;
