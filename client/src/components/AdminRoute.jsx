import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem("token");
      console.log('AdminRoute: Checking auth, token exists:', !!token);

      if (!token) {
        console.log('AdminRoute: No token found, redirecting to home');
        setIsAdmin(false);
        setIsLoading(false);
        navigate("/");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        console.log('AdminRoute: Token decoded successfully:', decoded);
        console.log('AdminRoute: User role from token:', decoded.role);
        console.log('AdminRoute: Is role admin?', decoded.role === 'admin');
        console.log('AdminRoute: Token raw:', token);
        
        // Check if user is admin
        if (decoded.role !== 'admin') {
          console.log('AdminRoute: User is not admin, redirecting to dashboard');
          setIsAdmin(false);
          setIsLoading(false);
          navigate("/dashboard");
          return;
        }

        console.log('AdminRoute: Admin authentication successful');
        setIsAdmin(true);
        setIsLoading(false);
      } catch (err) {
        console.error("AdminRoute: Invalid token:", err);
        localStorage.removeItem("token");
        setIsAdmin(false);
        setIsLoading(false);
        navigate("/");
      }
    };

    checkAdminAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-700">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to dashboard or landing page
  }

  return children;
}

export default AdminRoute;