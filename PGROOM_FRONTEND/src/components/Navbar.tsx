
import { Menu, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    switch (userRole) {
      case 1: return '/admin/dashboard';
      case 2: return '/owner/dashboard';
      case 3: return '/tenant/properties'; // Default to properties for tenants
      default: return '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-[hsl(var(--background-light-dark))] dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
              PropertyHub
            </h1>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link to={getDashboardUrl()}>
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex sm:hidden items-center space-x-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="default" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </Link>
            )}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
