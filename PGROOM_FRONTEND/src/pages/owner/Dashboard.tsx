import OwnerNavbar from "@/components/owner/OwnerNavbar";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import StatsDashboard from "@/components/dashboard/StatsDashboard";
import { memo } from "react";

/**
 * OwnerDashboard - Dashboard page for property owners
 *
 * This component uses the DashboardLayout for consistent UI across different dashboards
 */
const OwnerDashboard = () => {

  // Dashboard content with statistics dashboard
  const DashboardContent = memo(() => (
    <div className="w-full max-w-[98%] mx-auto">
      {/* Stats Dashboard */}
      <StatsDashboard />
    </div>
  ));

  return (
    <DashboardLayout
      navbar={<OwnerNavbar />}
      sidebar={<OwnerSidebar />}
    >
      <DashboardContent />
    </DashboardLayout>
  );
};

export default OwnerDashboard;
