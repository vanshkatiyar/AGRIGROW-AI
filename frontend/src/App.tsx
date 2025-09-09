import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { CallProvider } from "@/context/CallContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

// --- Page Imports ---
// General Pages
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Marketplace from "./pages/Marketplace";
import Weather from "./pages/Weather";
import SelectRole from "./pages/SelectRole";
import NotFound from "./pages/NotFound";
import MarketPrices from "./pages/MarketPrices";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import TestMessaging from "./pages/TestMessaging";
import ResponsiveTest from "./pages/ResponsiveTest";
import AIAssistantPage from "./pages/AIAssistantPage";
import CropDoctorPage from "./pages/CropDoctorPage";
import ConsultationHistory from "./pages/ConsultationHistory";
import ExpertsPage from './pages/ExpertsPage';

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Role-Specific Dashboard Pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ExpertDashboard from "./pages/expert/ExpertDashboard";

// Role-Specific Expense Tracker Pages
import FarmerExpenseTracker from "./pages/farmer/FarmerExpenseTracker";
import BuyerExpenseTracker from "./pages/buyer/BuyerExpenseTracker";
import ExpertExpenseTracker from "./pages/expert/ExpertExpenseTracker";

// Role-Specific Action Pages
import CreateArticlePage from "./pages/expert/CreateArticlePage";
import ServiceDiscovery from "./pages/farmer/ServiceDiscovery";

// Initialize React Query Client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <TooltipProvider>
          {/* Toast and Sonner components for notifications */}
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <Routes>
              {/* === Public Routes (Accessible without login) === */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* === Protected Routes (Require login) === */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />
              
              {/* Dashboards */}
              <Route path="/farmer-dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/expert-dashboard" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
              
              {/* Core Features */}
              <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
              <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
              <Route path="/crop-doctor" element={<ProtectedRoute><CropDoctorPage /></ProtectedRoute>} />
              
              {/* Expense Trackers */}
              <Route path="/farmer-expenses" element={<ProtectedRoute><FarmerExpenseTracker /></ProtectedRoute>} />
              <Route path="/buyer-expenses" element={<ProtectedRoute><BuyerExpenseTracker /></ProtectedRoute>} />
              <Route path="/expert-expenses" element={<ProtectedRoute><ExpertExpenseTracker /></ProtectedRoute>} />
              
              {/* User-Specific & Action Pages */}
              <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/test-messaging" element={<ProtectedRoute><TestMessaging /></ProtectedRoute>} />
              <Route path="/responsive-test" element={<ProtectedRoute><ResponsiveTest /></ProtectedRoute>} />
              <Route path="/consultation-history" element={<ProtectedRoute><ConsultationHistory /></ProtectedRoute>} />
              <Route path="/create-article" element={<ProtectedRoute><CreateArticlePage /></ProtectedRoute>} />
              <Route path="/find-experts" element={<ProtectedRoute><ExpertsPage /></ProtectedRoute>} />
              <Route path="/service-discovery" element={<ProtectedRoute><ServiceDiscovery /></ProtectedRoute>} /> 
              
              {/* === Catch-all Route for 404 Not Found === */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;