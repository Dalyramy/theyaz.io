import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";

import Index from "./pages/Index";
import PhotoView from "./pages/PhotoView";
import Upload from "./pages/Upload";
import EditPhoto from "./pages/EditPhoto";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute, { 
  PhotoUploadRoute, 
  PhotoEditRoute, 
  PhotoDeleteRoute,
  AdminRoute,
  UploaderRoute,
  ModeratorRoute,
  ContentManagerRoute,
  FullAdminRoute
} from "./components/ProtectedRoute";
import AuthCallback from "./pages/auth/callback";
import PrivateGallery from "./pages/PrivateGallery";
import ProfilePage from './pages/profile/[userId]';
import Inbox from './pages/messaging/Inbox';
import Conversation from './pages/messaging/Conversation';
import GalleryPage from './components/gallery/GalleryPage';
import AlbumPage from './components/gallery/AlbumPage';
import CategoryList from './components/gallery/CategoryList';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import RBACTest from './components/RBACTest';
import AdminDashboardComponent from './components/admin/AdminDashboard';
import PermissionDebug from './components/debug/PermissionDebug';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center">
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                  <main className="flex-1 w-full">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/public-gallery" element={<GalleryPage />} />
                      <Route path="/albums/:albumId" element={<AlbumPage />} />
                      <Route path="/categories" element={<CategoryList />} />
                      <Route path="/photo/:id" element={<PhotoView />} />
                      {/* Protected Routes with RBAC */}
                      <Route path="/upload" element={
                        <PhotoUploadRoute>
                          <Upload />
                        </PhotoUploadRoute>
                      } />
                      <Route path="/edit-photo/:id" element={
                        <PhotoEditRoute>
                          <EditPhoto />
                        </PhotoEditRoute>
                      } />
                      <Route path="/private-gallery" element={
                        <ProtectedRoute>
                          <PrivateGallery />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile/:userId" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/messaging" element={
                        <ProtectedRoute>
                          <Inbox />
                        </ProtectedRoute>
                      } />
                      <Route path="/messaging/:userId" element={
                        <ProtectedRoute>
                          <Conversation />
                        </ProtectedRoute>
                      } />
                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      <Route path="/admin-dashboard" element={
                        <AdminRoute>
                          <AdminDashboardComponent />
                        </AdminRoute>
                      } />
                      {/* Content Management Routes */}
                      <Route path="/moderate" element={
                        <ModeratorRoute>
                          <div className="container mx-auto px-4 py-8">
                            <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
                            <p>Moderation tools will be implemented here.</p>
                          </div>
                        </ModeratorRoute>
                      } />
                      <Route path="/analytics" element={
                        <ContentManagerRoute>
                          <div className="container mx-auto px-4 py-8">
                            <h1 className="text-3xl font-bold mb-6">Analytics</h1>
                            <p>Analytics dashboard will be implemented here.</p>
                          </div>
                        </ContentManagerRoute>
                      } />
                      {/* Debug and Test Routes */}
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/rbac-test" element={<RBACTest />} />
                      <Route path="/permission-debug" element={<PermissionDebug />} />
                      {/* Public Routes */}
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </AuthProvider>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
