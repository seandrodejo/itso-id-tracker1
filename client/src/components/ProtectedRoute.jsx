import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, requiredRole = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        
        // Check if role is required and user has it
        if (requiredRole && decoded.role !== requiredRole) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate("/dashboard"); // Redirect to dashboard if role doesn't match
          return;
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
}

export default ProtectedRoute;
