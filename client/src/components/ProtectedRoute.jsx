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
      console.log('ProtectedRoute: Checking auth, token exists:', !!token);

      if (!token) {
        console.log('ProtectedRoute: No token found, redirecting to home');
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate("/");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        console.log('ProtectedRoute: Token decoded successfully:', decoded);
        console.log('ProtectedRoute: User role from token:', decoded.role);
        console.log('ProtectedRoute: Is role admin?', decoded.role === 'admin');
        console.log('ProtectedRoute: Current path:', window.location.pathname);
        console.log('ProtectedRoute: Token raw:', token);
        
        // Parse the token manually to double-check
        try {
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('ProtectedRoute: Manual token decode:', payload);
          console.log('ProtectedRoute: Manual role check:', payload.role);
        } catch (e) {
          console.error('ProtectedRoute: Manual token decode failed:', e);
        }
        
        setUser(decoded);

        // Check if role is required and user has it
        if (requiredRole && decoded.role !== requiredRole) {
          console.log('ProtectedRoute: Role mismatch, required:', requiredRole, 'user has:', decoded.role);
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate("/dashboard"); // Redirect to dashboard if role doesn't match
          return;
        }
        
        // Check if this is the admin route and user is not an admin
        const isAdminRoute = window.location.pathname === '/admin';
        console.log('ProtectedRoute: Is admin route?', isAdminRoute);
        console.log('ProtectedRoute: Should allow admin access?', decoded.role === 'admin');
        
        if (isAdminRoute && decoded.role !== 'admin') {
          console.log('ProtectedRoute: Admin route accessed by non-admin user');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate("/dashboard"); // Redirect to dashboard if not admin
          return;
        }

        console.log('ProtectedRoute: Authentication successful');
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err) {
        console.error("ProtectedRoute: Invalid token:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate("/");
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
    return null; // Will redirect to landing page
  }

  return children;
}

export default ProtectedRoute;
