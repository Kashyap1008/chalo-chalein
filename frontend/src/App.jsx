import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TripListPage from "./pages/TripListPage";
import CreateTripPage from "./pages/CreateTripPage";
import ItineraryBuilderPage from "./pages/ItineraryBuilderPage";
import DiscoverySearchPage from "./pages/DiscoverySearchPage";
import PublicSharedItineraryPage from "./pages/PublicSharedItineraryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Discovery / Catalog */}
          <Route path="/discover" element={<DiscoverySearchPage />} />
          <Route path="/discovery" element={<DiscoverySearchPage />} />

          {/* Admin & Activity Analytics */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/analytics" element={<AdminDashboardPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />

          {/* Public Read-Only Share Pages */}
          <Route path="/share/:shareCode" element={<PublicSharedItineraryPage />} />
          <Route path="/shared/:shareCode" element={<PublicSharedItineraryPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <TripListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <ProtectedRoute>
                <CreateTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <ItineraryBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/edit"
            element={
              <ProtectedRoute>
                <ItineraryBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itinerary-builder"
            element={
              <ProtectedRoute>
                <ItineraryBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
