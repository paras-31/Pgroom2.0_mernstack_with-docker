import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProperties from "./pages/admin/Properties";
import AdminOwners from "./pages/admin/Owners";
import AdminTenants from "./pages/admin/Tenants";
import AdminPayments from "./pages/admin/Payments";
import AdminProfile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/Settings";
import AdminDatabase from "./pages/admin/Database";
import AdminSupport from "./pages/admin/Support";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerProperties from "./pages/owner/Properties";
import OwnerRooms from "./pages/owner/Rooms";
import OwnerTenants from "./pages/owner/Tenants";
import OwnerPayments from "./pages/owner/Payments";
import OwnerProfile from "./pages/owner/Profile";
import OwnerSupport from "./pages/owner/Support";
import TenantDashboard from "./pages/tenant/Dashboard";
import TenantRoom from "./pages/tenant/Room";
import TenantProperties from "./pages/tenant/Properties";
import TenantPropertyRooms from "./pages/tenant/PropertyRooms";
import TenantPayments from "./pages/tenant/Payments";
import TenantProfile from "./pages/tenant/Profile";
import TenantSupport from "./pages/tenant/Support.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login isRegisterRoute={true} />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Admin routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/properties" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminProperties />
                  </ProtectedRoute>
                } />
                <Route path="/admin/owners" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminOwners />
                  </ProtectedRoute>
                } />
                <Route path="/admin/tenants" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminTenants />
                  </ProtectedRoute>
                } />
                <Route path="/admin/payments" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminPayments />
                  </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminProfile />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/database" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminDatabase />
                  </ProtectedRoute>
                } />
                <Route path="/admin/support" element={
                  <ProtectedRoute allowedRoles={[1]}>
                    <AdminSupport />
                  </ProtectedRoute>
                } />

                {/* Protected Owner routes */}
                <Route path="/owner/dashboard" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/owner/properties" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerProperties />
                  </ProtectedRoute>
                } />
                <Route path="/owner/properties/:propertyId/rooms" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerRooms />
                  </ProtectedRoute>
                } />
                <Route path="/owner/tenants" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerTenants />
                  </ProtectedRoute>
                } />
                <Route path="/owner/payments" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerPayments />
                  </ProtectedRoute>
                } />
                <Route path="/owner/profile" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/owner/support" element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <OwnerSupport />
                  </ProtectedRoute>
                } />

                {/* Protected Tenant routes */}
                <Route path="/tenant/dashboard" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/tenant/room" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantRoom />
                  </ProtectedRoute>
                } />
                <Route path="/tenant/properties" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantProperties />
                  </ProtectedRoute>
                } />
                <Route path="/tenant/properties/:propertyId/rooms" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantPropertyRooms />
                  </ProtectedRoute>
                } />
                <Route path="/tenant/payments" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantPayments />
                  </ProtectedRoute>
                } />
                <Route path="/tenant/profile" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantProfile />
                  </ProtectedRoute>
                } />
                <Route path="/tenant/support" element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <TenantSupport />
                  </ProtectedRoute>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
