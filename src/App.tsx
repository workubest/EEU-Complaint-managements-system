import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Suspense, lazy, memo } from "react";
import { Loader2 } from "lucide-react";

// Lazy load components for better performance
const Login = lazy(() => import("@/pages/Login").then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then(module => ({ default: module.Dashboard })));
const ComplaintForm = lazy(() => import("@/pages/ComplaintForm").then(module => ({ default: module.ComplaintForm })));
const ComplaintsList = lazy(() => import("@/pages/ComplaintsList").then(module => ({ default: module.ComplaintsList })));

const ComplaintDetail = lazy(() => import("@/pages/ComplaintDetail"));
const Analytics = lazy(() => import("@/pages/Analytics").then(module => ({ default: module.Analytics })));
const Reports = lazy(() => import("@/pages/Reports").then(module => ({ default: module.Reports })));
const UserManagement = lazy(() => import("@/pages/UserManagement").then(module => ({ default: module.UserManagement })));
const Notifications = lazy(() => import("@/pages/Notifications").then(module => ({ default: module.Notifications })));
const Settings = lazy(() => import("@/pages/Settings").then(module => ({ default: module.Settings })));
const PermissionManagement = lazy(() => import("@/pages/PermissionManagement"));
const ComplaintFormAmharic = lazy(() => import("@/components/forms/ComplaintFormAmharic"));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const QuickReport = lazy(() => import("@/pages/QuickReport"));
const NotFound = lazy(() => import("./pages/NotFound"));


// Loading component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
));

const AppRoutes = memo(() => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/customer-portal" element={<CustomerPortal />} />
        <Route path="/quick-report" element={<QuickReport />} />
        <Route path="/login" element={<Login />} />

        
        {/* Redirect /notifications to /dashboard/notifications */}
        <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />
        
        {/* Protected Routes */}
        {!isAuthenticated ? (
          <Route path="/dashboard/*" element={<Login />} />
        ) : (
          <Route path="/dashboard/*" element={
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route 
                    path="/complaints/new" 
                    element={
                      <ProtectedRoute resource="complaints" action="create">
                        <ComplaintForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/complaints/new-amharic" 
                    element={
                      <ProtectedRoute resource="complaints" action="create">
                        <ComplaintFormAmharic />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/complaints" 
                    element={
                      <ProtectedRoute resource="complaints" action="read">
                        <ComplaintsList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/complaints/:id" 
                    element={
                      <ProtectedRoute resource="complaints" action="read">
                        <ComplaintDetail />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute resource="reports" action="read">
                        <Analytics />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reports" 
                    element={
                      <ProtectedRoute resource="reports" action="read">
                        <Reports />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <ProtectedRoute resource="users" action="read">
                        <UserManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute resource="settings" action="read">
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/permissions" 
                    element={
                      <ProtectedRoute resource="settings" action="update">
                        <PermissionManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          } />
        )}
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
});

// Optimize React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'development',
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <DashboardProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </DashboardProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
));

export default App;