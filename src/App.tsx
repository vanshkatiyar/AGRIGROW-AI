import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Marketplace from "./pages/Marketplace";
import Weather from "./pages/Weather";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register"; // Import Register
import SelectRole from "./pages/SelectRole"; // Import SelectRole
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import MarketPrices from "./pages/MarketPrices";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} /> {/* Add Register route */}
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/farmer-dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/expert-dashboard" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
            <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />

            {/* --- CHANGE: Add the new route for selecting a role --- */}
            <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />

            {/* Placeholder routes */}
            <Route path="/messages" element={<ProtectedRoute><div className="min-h-screen flex items-center justify-center"><p>Messages - Coming Soon</p></div></ProtectedRoute>} />
            <Route path="/qa" element={<ProtectedRoute><div className="min-h-screen flex items-center justify-center"><p>Q&A Hub - Coming Soon</p></div></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;