import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Marketplace from "./pages/Marketplace";
import Weather from "./pages/Weather";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SelectRole from "./pages/SelectRole";
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import MarketPrices from "./pages/MarketPrices";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import CropDoctorPage from "./pages/CropDoctorPage";
import FarmerExpenseTracker from "./pages/farmer/FarmerExpenseTracker";
import BuyerExpenseTracker from "./pages/buyer/BuyerExpenseTracker";
import ExpertExpenseTracker from "./pages/expert/ExpertExpenseTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />
              <Route path="/farmer-dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/expert-dashboard" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
              <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
              <Route path="/crop-doctor" element={<ProtectedRoute><CropDoctorPage /></ProtectedRoute>} />
              <Route path="/farmer-expenses" element={<ProtectedRoute><FarmerExpenseTracker /></ProtectedRoute>} />
              <Route path="/buyer-expenses" element={<ProtectedRoute><BuyerExpenseTracker /></ProtectedRoute>} />
              <Route path="/expert-expenses" element={<ProtectedRoute><ExpertExpenseTracker /></ProtectedRoute>} />
              
              {/* --- THIS ROUTE IS NOW DYNAMIC --- */}
              <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              
              {/* Catch-all for any other route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;