import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Component, ErrorInfo, ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeProvider";

import Index from "./pages/Index";
import PhotoView from "./pages/PhotoView";
import Upload from "./pages/Upload";
import MyPhotos from "./pages/MyPhotos";
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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-8 rounded-lg shadow-soft bg-card animate-fade-in">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors hover-lift"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
              {/* Remove the top logo image */}
              {/* <img src="/icons/theyaz-logo.svg" alt="theyaz.io logo" style={{ height: 96, width: 'auto', marginBottom: 24, filter: 'drop-shadow(0 4px 16px #00f2ff88)' }} /> */}
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <main className="flex-1 w-full">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/gallery" element={
                        <ProtectedRoute>
                          <PrivateGallery />
                        </ProtectedRoute>
                      } />
                      <Route path="/photo/:id" element={<PhotoView />} />
                      <Route path="/upload" element={
                        <ProtectedRoute>
                          <Upload />
                        </ProtectedRoute>
                      } />
                      <Route path="/my-photos" element={
                        <ProtectedRoute>
                          <MyPhotos />
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
