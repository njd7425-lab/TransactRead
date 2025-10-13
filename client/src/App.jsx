import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WalletDetail from './pages/WalletDetail';
import TransactionDetail from './pages/TransactionDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/wallet/:id" element={
                <ProtectedRoute>
                  <WalletDetail />
                </ProtectedRoute>
              } />
              <Route path="/transaction/:id" element={
                <ProtectedRoute>
                  <TransactionDetail />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
