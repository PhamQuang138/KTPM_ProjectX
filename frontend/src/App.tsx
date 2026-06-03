import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Garage from './pages/Garage';
import Editorial from './pages/Editorial';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Editorial />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/garage" element={<ProtectedRoute><Garage /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
