import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Garage from './pages/Garage';
import Editorial from './pages/Editorial';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import VehicleDetail from './pages/VehicleDetail';
import PublicProfile from './pages/PublicProfile';
import Favorites from './pages/Favorites';
import MessageDock from './components/MessageDock';
import ArticleDetail from './pages/ArticleDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<ProtectedRoute><Editorial /></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/market/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/garage" element={<ProtectedRoute><Garage /></ProtectedRoute>} />
        <Route path="/liked" element={<ProtectedRoute><Favorites mode="liked" /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><Favorites mode="saved" /></ProtectedRoute>} />
        <Route path="/favorites" element={<Navigate to="/liked" replace />} />
        <Route path="/profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MessageDock />
    </Router>
  );
}
