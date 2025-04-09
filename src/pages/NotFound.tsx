
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Query params:",
      location.search,
      "Full URL:",
      window.location.href
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="bg-muted p-4 rounded-md mb-6 text-left overflow-auto max-h-32">
          <p className="text-muted-foreground text-sm mb-2">
            <strong>Path:</strong> {location.pathname}
          </p>
          <p className="text-muted-foreground text-sm mb-2">
            <strong>Query:</strong> {location.search || "(none)"}
          </p>
          <p className="text-muted-foreground text-sm">
            <strong>Full URL:</strong> {window.location.href}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/')}
          className="text-primary-foreground hover:bg-primary/90"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
