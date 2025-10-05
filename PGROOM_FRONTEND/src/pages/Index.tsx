
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { Link } from "react-router-dom";
import { ArrowRight, Home, Shield, CreditCard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, userRole } = useAuth();

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
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))]">

      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Simplify Your{" "}
            <span className="text-green-600 dark:text-green-400">
              PG Management
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect property owners and tenants seamlessly. Manage properties, track expenses,
            and streamline your PG operations all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to={getDashboardUrl()}>
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg">
                  Explore Property Hub
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-[hsl(var(--background-light-dark))]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose PropertyHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Home className="h-6 w-6" />}
              title="Property Management"
              description="Easily manage multiple properties, rooms, and tenants from a single dashboard."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Expense Tracking"
              description="Track rent payments, utilities, and maintenance expenses effortlessly."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure Platform"
              description="Your data is protected with enterprise-grade security measures."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of property owners and tenants who trust PropertyHub
            for their PG management needs.
          </p>
          {isAuthenticated ? (
            <Link to={getDashboardUrl()}>
              <Button size="lg">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="lg">
                Get Started Now
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="p-6 rounded-xl bg-gray-50 dark:bg-[hsl(var(--background))]">
      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

export default Index;
