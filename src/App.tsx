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
import ProtectedRoute from "./components/ProtectedRoute";
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
                      <Route path="/upload" element={
                        <ProtectedRoute requiredPermission="photos.create">
                          <Upload />
                        </ProtectedRoute>
                      } />
                      <Route path="/edit-photo/:id" element={
                        <ProtectedRoute>
                          <EditPhoto />
                        </ProtectedRoute>
                      } />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/profile/:userId" element={<ProfilePage />} />
                      <Route path="/messaging" element={<Inbox />} />
                      <Route path="/messaging/:userId" element={<Conversation />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/rbac-test" element={<RBACTest />} />
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
