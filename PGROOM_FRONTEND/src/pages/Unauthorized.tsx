import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[hsl(var(--background))]">
      <div className="text-center max-w-md p-8 bg-white dark:bg-[hsl(var(--background-light-dark))] rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Unauthorized Access
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You don't have permission to access this page. Please log in with the appropriate credentials or contact your administrator.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Back to Login
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
