import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';

/**
 * AdminDashboard - Comprehensive admin dashboard with system analytics
 */
const AdminDashboard = () => {
  return (
    <DashboardLayout
      navbar={<AdminNavbar />}
      sidebar={<AdminSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Dashboard Content */}
        <AdminStatsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
