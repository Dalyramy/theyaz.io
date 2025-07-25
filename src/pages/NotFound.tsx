import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {/* Peace Sign Background Watermark */}
      <div 
        className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
        style={{
          width: '300px',
          height: '300px',
          backgroundImage: 'url(/icons/peace-watermark.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(-10deg)',
        }}
      />
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link to="/">
          <Button className="hover-lift">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
