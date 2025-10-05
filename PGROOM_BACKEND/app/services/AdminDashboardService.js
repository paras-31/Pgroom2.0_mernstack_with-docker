const constant = require("../constant/Constant");
const propertyRepository = require("../repository/PropertyRepository");
const roomRepository = require("../repository/RoomRepository");
const tenantRepository = require("../repository/TenantRepository");
const userRepository = require("../repository/UserRepository");

/**
 * AdminDashboardService - Service for admin dashboard analytics and statistics
 */
class AdminDashboardService {
  constructor() {
    this.propertyRepository = new propertyRepository();
    this.roomRepository = roomRepository;
    this.tenantRepository = tenantRepository;  
    this.userRepository = userRepository;
  }

  /**
   * Get admin dashboard overview statistics
   */
  async getAdminOverview() {
    try {
      // Get total users (owners + tenants)
      const OWNER_ROLE_ID = 2;
      const TENANT_ROLE_ID = 3;

      // Get owners count
      const ownersResult = await this.userRepository.getUsersByRoleId(
        OWNER_ROLE_ID,
        null, // no search
        [], // no search fields
        null, // no status filter
        1, // page
        10000, // large limit to get all
        []
      );
      const totalOwners = ownersResult.meta.total;

      // Get tenants count
      const tenantsResult = await this.userRepository.getUsersByRoleId(
        TENANT_ROLE_ID,
        null,
        [],
        null,
        1,
        10000,
        []
      );
      const totalTenants = tenantsResult.meta.total;

      // Get active owners
      const activeOwners = ownersResult.data.filter(
        owner => owner.user.status === constant.ACTIVE
      ).length;

      // Get property statistics (admin gets all properties)
      const propertyStats = await this.propertyRepository.getPropertyStatistics();

      return {
        totalUsers: totalOwners + totalTenants,
        totalOwners,
        totalTenants,
        activeOwners,
        activeTenants: tenantsResult.data.filter(t => t.user.status === constant.ACTIVE).length,
        totalProperties: propertyStats.totalProperties,
        totalRooms: propertyStats.totalRooms,
        monthlyRevenue: propertyStats.monthlyRevenue,
        occupancyRate: propertyStats.occupancyRate || 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent activity for admin dashboard
   */
  async getRecentActivity() {
    try {
      const activities = [];

      // Get recent tenant registrations
      const recentTenants = await this.userRepository.getUsersByRoleId(
        3, // tenant role
        null,
        [],
        null, // get all statuses for recent activity
        1,
        3, // last 3 tenants
        ['createdAt']
      );

      recentTenants.data.forEach((tenant) => {
        activities.push({
          id: `tenant_${tenant.user.id}`,  
          type: 'tenant',
          title: 'New Tenant Registered',
          description: `${tenant.user.firstName} ${tenant.user.lastName} joined the platform`,
          time: this.getRelativeTime(tenant.user.createdAt),
          status: 'success',
          createdAt: tenant.user.createdAt
        });
      });

      // Get recent owner registrations
      const recentOwners = await this.userRepository.getUsersByRoleId(
        2, // owner role
        null,
        [],
        null, // get all statuses
        1,
        3, // last 3 owners
        ['createdAt']
      );

      recentOwners.data.forEach((owner) => {
        activities.push({
          id: `owner_${owner.user.id}`,  
          type: 'registration',
          title: 'New Owner Registered',
          description: `${owner.user.firstName} ${owner.user.lastName} registered as property owner`,
          time: this.getRelativeTime(owner.user.createdAt),
          status: 'success',
          createdAt: owner.user.createdAt
        });
      });

      // Get recent properties
      const recentProperties = await this.propertyRepository.getRecentProperties(4);
      recentProperties.forEach((property) => {
        activities.push({
          id: `property_${property.id}`,
          type: 'property',
          title: 'Property Added', 
          description: `New property "${property.propertyName}" was added`,
          time: this.getRelativeTime(property.createdAt),
          status: 'success',
          createdAt: property.createdAt
        });
      });

      // Sort activities by createdAt (most recent first)
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Remove the createdAt field before returning (not needed in frontend)
      const cleanedActivities = activities.map(({ createdAt, ...activity }) => activity);

      return cleanedActivities.slice(0, 10); // Return top 10 activities
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;  
    }
  }

  /**
   * Get system health metrics for admin dashboard
   */
  async getSystemHealthMetrics() {
    try {
      // This would normally come from system monitoring tools
      // For now, return structured mock data that represents real metrics
      
      const totalProperties = await this.propertyRepository.getPropertyCount(null); // null for all properties
      const totalRooms = await this.roomRepository.getRoomCount([]);
      
      return {
        systemStatus: 'healthy',
        databaseStatus: 'connected',
        totalRecords: totalProperties + totalRooms,
        apiResponseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
        uptime: '99.9%',
        activeConnections: Math.floor(Math.random() * 50) + 10 // 10-60 connections
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper method to get relative time
   */
  getRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  }
}

module.exports = AdminDashboardService;
