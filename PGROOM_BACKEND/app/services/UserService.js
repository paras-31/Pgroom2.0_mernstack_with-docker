const constant = require("../constant/Constant");
const userRepository = require("../repository/UserRepository");
const tenantRepository = require("../repository/TenantRepository");
const PropertyRepository = require("../repository/PropertyRepository");
const roomRepository = require("../repository/RoomRepository");

class userService {
  constructor(repository, tenantRepository) {
    this.repository = repository;
    this.tenantRepository = tenantRepository;
    this.propertyRepository = new PropertyRepository();
    this.roomRepository = roomRepository; // This is already an instance
  }

  /**
   * function to getTenants users
   */
  async getTenants(data) {
    try {
      const page = Number(data.page) || 1;
      const limit = Number(data.limit) || 10;
      const searchFields = ["firstName", "lastName"];
      const status = data?.status ?? null;
      const additionalColumns = ["mobileNo"];
      const stateId = Number(data.stateId) ?? null;
      const cityId = Number(data.cityId) ?? null;
      
      // Fetch users and tenant user IDs
      const [users, tenantUserIds] = await Promise.all([
        this.repository.getUsersByRoleId(
          constant.TENANT_ROLE_ID,
          data.search,
          searchFields,
          status,
          page,
          limit,
          additionalColumns,
          stateId,
          cityId
        ),
        this.tenantRepository.getTenantUserIds(),
      ]);

      // Convert tenantUserIds array to Set for optimized lookups
      const tenantUserIdSet = new Set(tenantUserIds);

      // Filter out users who are already tenants (have active assignments)
      const filteredUsers = users.data.filter(
        (user) => !tenantUserIdSet.has(user.user.id)
      );

      return {
        data: filteredUsers,
        meta: {
          total: filteredUsers.length,
          page,
          limit,
          totalPages: Math.ceil(filteredUsers.length / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * function to get owners for admin
   */
  async getOwners(data) {
    try {
      const page = Number(data.page) || 1;
      const limit = Number(data.limit) || 10;
      const searchFields = ["firstName", "lastName"];
      const status = data?.status ?? null;
      const additionalColumns = ["mobileNo", "address"];
      const stateId = Number(data.stateId) ?? null;
      const cityId = Number(data.cityId) ?? null;
      
      // Use role ID 2 for owners based on the frontend routing
      const OWNER_ROLE_ID = 2;
      
      // Fetch owners from the repository
      const owners = await this.repository.getUsersByRoleId(
        OWNER_ROLE_ID,
        data.search,
        searchFields,
        status,
        page,
        limit,
        additionalColumns,
        stateId,
        cityId
      );

      // Enhance owner data with property information
      const enhancedOwners = await Promise.all(
        owners.data.map(async (ownerData) => {
          const owner = ownerData.user;
          
          // Get property count and details for this owner
          const [propertyCount, properties] = await Promise.all([
            this.propertyRepository.getPropertyCount(owner.id),
            this.propertyRepository.getAllPropertiesIds(owner.id)
          ]);

          // Calculate total rooms and occupied rooms
          let totalRooms = 0;
          let occupiedRooms = 0;
          let monthlyRevenue = 0;

          for (const property of properties) {
            const rooms = await this.roomRepository.getRoomsByPropertyId(property.id);
            totalRooms += rooms.length;
            
            for (const room of rooms) {
              const activeTenants = await this.tenantRepository.getTenants(
                property.id, 
                room.id, 
                constant.ACTIVE
              );
              if (activeTenants.length > 0) {
                occupiedRooms++;
                monthlyRevenue += parseFloat(room.rent) || 0;
              }
            }
          }

          return {
            id: owner.id,
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
            mobileNo: owner.mobileNo,
            address: owner.address,
            stateId: owner.stateId,
            cityId: owner.cityId,
            status: owner.status.toLowerCase(),
            joinDate: owner.createdAt,
            verified: true, // You can add verification logic here
            rating: 4.5, // Placeholder - implement rating system
            totalProperties: propertyCount,
            totalRooms,
            occupiedRooms,
            monthlyRevenue,
            stateName: owner.state?.stateName || '',
            cityName: owner.city?.cityName || ''
          };
        })
      );

      return {
        data: enhancedOwners,
        meta: owners.meta,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * function to get owner statistics for admin
   */
  async getOwnerStatistics() {
    try {
      const OWNER_ROLE_ID = 2;
      
      // Get all owners
      const allOwners = await this.repository.getUsersByRoleId(
        OWNER_ROLE_ID,
        null, // no search
        [], // no search fields
        null, // no status filter
        1, // page
        1000, // large limit to get all
        [] // no additional columns needed
      );

      const totalOwners = allOwners.meta.total;
      const activeOwners = allOwners.data.filter(
        owner => owner.user.status === constant.ACTIVE
      ).length;

      // Get total properties across all owners
      let totalProperties = 0;
      for (const ownerData of allOwners.data) {
        const ownerPropertyCount = await this.propertyRepository.getPropertyCount(ownerData.user.id);
        totalProperties += ownerPropertyCount;
      }
      
      // Calculate total revenue - this is a simplified calculation
      // In a real system, you'd sum from actual payment records
      let totalRevenue = 0;
      let totalRooms = 0;
      let occupiedRooms = 0;

      for (const ownerData of allOwners.data) {
        const properties = await this.propertyRepository.getAllPropertiesIds(ownerData.user.id);
        
        for (const property of properties) {
          const rooms = await this.roomRepository.getRoomsByPropertyId(property.id);
          totalRooms += rooms.length;
          
          for (const room of rooms) {
            const activeTenants = await this.tenantRepository.getTenants(
              property.id, 
              room.id, 
              constant.ACTIVE
            );
            if (activeTenants.length > 0) {
              occupiedRooms++;
              totalRevenue += parseFloat(room.rent) || 0;
            }
          }
        }
      }

      const averageOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      return {
        totalOwners,
        activeOwners,
        totalProperties,
        totalRevenue,
        averageOccupancy
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * function to update owner status
   */
  async updateOwnerStatus(data) {
    try {
      const { ownerId, status } = data;
      
      // Update user status
      const result = await this.repository.updateUserStatus(ownerId, status);
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new userService(userRepository, tenantRepository);
