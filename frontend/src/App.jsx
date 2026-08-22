import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import DiscoverySearchPage from './pages/DiscoverySearchPage';
import PublicSharedItineraryPage from './pages/PublicSharedItineraryPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0f172a]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/itinerary-builder" element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />
          <Route path="/discovery" element={<ProtectedRoute><DiscoverySearchPage /></ProtectedRoute>} />
          <Route path="/shared-itinerary" element={<PublicSharedItineraryPage />} />
          <Route path="/share/:shareId" element={<PublicSharedItineraryPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 