import React from 'react';
import { Building2, Search, User, HelpCircle } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import TenantNavbar from '@/components/tenant/TenantNavbar';
import TenantSidebar from '@/components/tenant/TenantSidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import TenantStatsDashboard from '@/components/dashboard/TenantStatsDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { useTenantRoomStatus } from '@/hooks/useTenantRoomStatus';

const TenantDashboard = () => {
  const { userRole } = useAuth();
  const { hasRoom, isLoading: isRoomStatusLoading } = useTenantRoomStatus();

  // Show loading state while determining room status
  if (isRoomStatusLoading) {
    return (
      <DashboardLayout
        navbar={<TenantNavbar />}
        sidebar={<TenantSidebar />}
      >
        <div className="w-full max-w-[98%] mx-auto space-y-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navbar={<TenantNavbar />}
      sidebar={<TenantSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative">
          {!hasRoom && (
            <div className="relative overflow-hidden bg-gradient-to-r from-primary via-green-600 to-emerald-700 dark:from-primary dark:via-green-500 dark:to-emerald-600 rounded-2xl shadow-2xl p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Welcome to PropertyHub
                    </h1>
                    <p className="text-green-100 text-lg font-medium">
                      Your journey to finding the perfect room starts here
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <Search className="h-6 w-6 text-white mb-2" />
                    <h3 className="text-white font-semibold">Explore Properties</h3>
                    <p className="text-green-100 text-sm">Browse available rooms</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <User className="h-6 w-6 text-white mb-2" />
                    <h3 className="text-white font-semibold">Complete Profile</h3>
                    <p className="text-green-100 text-sm">Update your information</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <HelpCircle className="h-6 w-6 text-white mb-2" />
                    <h3 className="text-white font-semibold">Get Support</h3>
                    <p className="text-green-100 text-sm">We're here to help</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tenant Monitoring Cards - Show for tenants with rooms */}
        {hasRoom && (
          <TenantStatsDashboard />
        )}

        {/* Stats Cards Grid - Only show for tenants without rooms */}
        {!hasRoom && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show welcoming stats for tenants without rooms */}
            <StatsCard
              title="🏠 Account Ready"
              value="Start Exploring"
              icon={<User className="w-5 h-5" />}
              description="Your profile is set up"
              isLoading={isRoomStatusLoading}
            />

            <StatsCard
              title="🔍 Properties"
              value="Browse Available"
              icon={<Building2 className="w-5 h-5" />}
              description="Find your perfect room"
              isLoading={isRoomStatusLoading}
            />

            <StatsCard
              title="💬 Support"
              value="24/7 Available"
              icon={<HelpCircle className="w-5 h-5" />}
              description="Get help anytime"
              isLoading={isRoomStatusLoading}
            />
          </div>
        )}

        {/* Quick Actions Grid - Only show for tenants without rooms */}
        {!hasRoom && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Enhanced Browse Properties Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Start Here
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Explore Properties</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Discover amazing properties and rooms that match your preferences and budget.
              </p>
              <Button onClick={() => window.location.href = '/tenant/properties'} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Card>

            {/* Enhanced Profile Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Important
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Add your details to help property owners know more about you.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/tenant/profile'} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Manage Profile
              </Button>
            </Card>

            {/* Enhanced Support Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <HelpCircle className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    24/7
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Need Assistance?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get help with finding rooms, understanding the process, or any other questions.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/tenant/support'} className="w-full">
                <HelpCircle className="h-4 w-4 mr-2" />
                Get Help
              </Button>
            </Card>
          </div>
        )}

        {/* Getting Started Guide - Only show for tenants without rooms */}
        {!hasRoom && (
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎯 Getting Started Guide
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Follow these simple steps to find your perfect room
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Complete Profile</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Fill in your personal details and preferences
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Browse Properties</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Explore available rooms and properties
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Connect with Owners</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Contact property owners for room viewing
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TenantDashboard;
