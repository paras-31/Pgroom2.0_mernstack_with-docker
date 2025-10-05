const constant = require("../constant/Constant");
const tenantRepository = require("../repository/TenantRepository");
const { parseInputData } = require("../utils/DataParseHelper");
const { getFileFromS3 } = require("../utils/AwsHelper");

class tenantService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Function to create tenant
   */
  async createTenant(data) {
    try {
      const parsedData = parseInputData(data, {
        integerFields: ["propertyId", "roomId"],
        integerArrayFields: ["userIds"],
      });

      const result = await Promise.all(
        parsedData.userIds.map((userId) =>
          this.repository.createOrUpdateTenant(
            userId,
            parsedData.propertyId,
            parsedData.roomId
          )
        )
      );

      // Update room status after creating tenants
      await this.#updateRoomStatus(parsedData.roomId);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /*
   * Function to update tenant assignments for a given property and room.
   * It deletes removed tenants, restores deleted ones, and creates new tenants as needed.
   */
  async updateTenant(data) {
    try {
      // Parse and validate input data
      const {
        propertyId,
        roomId,
        userIds = [],
        ids = [],
      } = parseInputData(data, {
        integerFields: ["propertyId", "roomId"],
        integerArrayFields: ["userIds", "ids"],
      });

      // Fetch current tenants from the database
      const existingTenants = await this.repository.getTenants(
        propertyId,
        roomId
      );
      const existingIds = existingTenants.map(({ id }) => id);

      // Handle deletions: remove tenants that are no longer in the updated list
      await this.#handleDeletions(existingIds, ids);

      // Handle creations and restorations of tenants
      await this.#handleCreationsAndRestorations(propertyId, roomId, userIds);

      // Update room status based on current tenant assignments
      await this.#updateRoomStatus(roomId);

      return true;
    } catch (error) {
      // Wrap error with more context
      throw new Error(`updateTenant failed: ${error.message}`);
    }
  }

  /*
   * Delete tenants that exist in DB but are not in the updated tenant ID list.
   */
  async #handleDeletions(existingIds, updatedTenantIds) {
    const idsToDelete = existingIds.filter(
      (id) => !updatedTenantIds.includes(id)
    );
    
    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((id) => this.deleteTenant(id))
      );
    }
  }

  /*
   * Restore previously deleted tenants if included in the new list,
   * and create new tenants that were not previously present.
   */
  async #handleCreationsAndRestorations(propertyId, roomId, userIds) {
    if (userIds.length === 0) return;

    // Get previously deleted tenants for the property and room
    const deletedTenants = await this.repository.getTenants(
      propertyId,
      roomId,
      constant.DELETED
    );

    // Find tenants to restore from deleted list
    const tenantsToRestore = deletedTenants.filter((tenant) =>
      userIds.includes(tenant.userId)
    );
    const restoredUserIds = tenantsToRestore.map((t) => t.userId);
    const idsToRestore = tenantsToRestore.map((t) => t.id);

    // Restore deleted tenants
    if (idsToRestore.length > 0) {
      await Promise.all(
        idsToRestore.map((id) => this.repository.updateTenant(id))
      );
    }

    // Create tenants that are not in the restored list
    const newUserIds = userIds.filter((id) => !restoredUserIds.includes(id));
    if (newUserIds.length > 0) {
      await this.createTenant({ propertyId, roomId, userIds: newUserIds });
    }
  }

  /**
   * Function to get tenants
   */
  async getTenants(data) {
    try {
      const parsedData = parseInputData(data, {
        integerFields: ["propertyId", "roomId"],
      });

      // Fetch tenants from the repository using propertyId and roomId
      const tenants = await this.repository.getTenants(
        parsedData.propertyId,
        parsedData.roomId
      );

      return tenants.map((tenant) => ({
        id: tenant.id,
        userId: tenant.userId,
        username: `${tenant.user.firstName} ${tenant.user.lastName}`,
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to delete tenant
   */
  async deleteTenant(id) {
    try {
      // Get tenant details before deletion to update room status
      const tenant = await this.repository.dbClient.tenant.findUnique({
        where: { id },
        select: { roomId: true }
      });

      const result = await this.repository.updateTenant(id, constant.DELETED);
      
      // Update room status after tenant deletion
      if (tenant?.roomId) {
        await this.#updateRoomStatus(tenant.roomId);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get tenant ID by user ID
   */
  async getTenantIdByUserId(userId) {
    try {
      return await this.repository.getTenantIdByUserId(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get tenant's current room details by user ID
   */
  async getTenantRoomDetails(userId) {
    try {
      const tenantRoom = await this.repository.getTenantRoomByUserId(userId);

      if (!tenantRoom) {
        return null;
      }

      // Parse room images if they exist and generate signed URLs
      let roomImages = [];
      if (tenantRoom.Rooms.roomImage) {
        try {
          const imagePaths = JSON.parse(tenantRoom.Rooms.roomImage);
          roomImages = await Promise.all(
            imagePaths.map(async (filePath) => {
              return await getFileFromS3(filePath, constant.S3_EXPIRY);
            })
          );
        } catch (error) {
          console.error('Error parsing room images:', error);
          roomImages = [];
        }
      }

      return {
        id: tenantRoom.Rooms.id,
        roomNo: tenantRoom.Rooms.roomNo,
        rent: tenantRoom.Rooms.rent,
        description: tenantRoom.Rooms.description,
        status: tenantRoom.Rooms.status,
        totalBed: tenantRoom.Rooms.totalBed,
        roomImage: roomImages,
        property: {
          id: tenantRoom.Rooms.userProperties.id,
          name: tenantRoom.Rooms.userProperties.propertyName,
          address: tenantRoom.Rooms.userProperties.propertyAddress,
          type: tenantRoom.Rooms.userProperties.status,
        },
        tenants: tenantRoom.Rooms.Tenant.map(tenant => ({
          id: tenant.user.id,
          name: `${tenant.user.firstName} ${tenant.user.lastName}`,
          firstName: tenant.user.firstName,
          lastName: tenant.user.lastName,
        })),
        occupancy: {
          current: tenantRoom.Rooms.Tenant.length,
          total: tenantRoom.Rooms.totalBed,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Function to get all tenants with property and room details for admin panel
   */
  async getAllTenantsWithDetails(data) {
    try {
      const filters = parseInputData(data, {
        integerFields: ["page", "limit"],
        stringFields: ["search", "status", "sortBy", "sortOrder"]
      });

      // Set defaults and ensure status is properly mapped
      filters.page = filters.page || 1;
      filters.limit = filters.limit || 10;
      filters.sortBy = filters.sortBy || 'user.firstName';
      filters.sortOrder = filters.sortOrder || 'asc';
      
      // Map frontend status values to backend constants
      if (!filters.status || filters.status === 'active') {
        filters.status = constant.ACTIVE; // "Active"
      } else if (filters.status === 'suspended' || filters.status === 'inactive') {
        filters.status = constant.DELETED; // "Deleted"
      }
      // 'all' remains as is

      const result = await this.repository.getAllTenantsWithDetails(filters);

      // Transform the data for frontend consumption
      const transformedData = result.data.map(tenant => ({
        id: tenant.id,
        userId: tenant.userId,
        propertyId: tenant.propertyId,
        roomId: tenant.roomId,
        user: {
          id: tenant.user.id,
          firstName: tenant.user.firstName,
          lastName: tenant.user.lastName,
          email: tenant.user.email,
          mobileNo: tenant.user.mobileNo || '',
          address: tenant.user.address || '',
          stateId: tenant.user.stateId,
          cityId: tenant.user.cityId,
          status: tenant.user.status,
          state: tenant.user.state,
          city: tenant.user.city
        },
        property: {
          id: tenant.Rooms?.userProperties?.id || 0,
          name: tenant.Rooms?.userProperties?.propertyName || 'N/A',
          address: tenant.Rooms?.userProperties?.propertyAddress || 'N/A'
        },
        room: {
          id: tenant.Rooms?.id || 0,
          roomNo: tenant.Rooms?.roomNo || 'N/A',
          rent: parseInt(tenant.Rooms?.rent || '0'),
          description: tenant.Rooms?.description,
          status: tenant.Rooms?.status || 'Available'
        },
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        status: tenant.status === constant.ACTIVE ? 'active' : 'suspended'
      }));

      // Calculate stats
      const stats = {
        totalTenants: result.meta.total,
        activeTenants: result.data.filter(t => t.status === constant.ACTIVE).length,
        suspendedTenants: result.data.filter(t => t.status !== constant.ACTIVE).length,
        totalRentCollected: result.data
          .filter(t => t.status === constant.ACTIVE)
          .reduce((sum, tenant) => sum + parseInt(tenant.Rooms?.rent || '0'), 0),
        overduePayments: Math.floor(Math.random() * 5), // Mock - would need payment integration
        averageOccupancy: result.meta.total > 0 ? Math.round((transformedData.filter(t => t.status === 'active').length / result.meta.total) * 100) : 0
      };

      return {
        data: transformedData,
        meta: result.meta,
        stats
      };
    } catch (error) {
      throw error;
    }
  }

  /*
   * Update room status based on current tenant assignments
   */
  async #updateRoomStatus(roomId) {
    try {
      // Get the room details including current active tenants
      const room = await this.repository.dbClient.rooms.findUnique({
        where: { id: roomId },
        include: {
          _count: {
            select: {
              Tenant: {
                where: {
                  status: constant.ACTIVE
                }
              }
            }
          }
        }
      });

      if (!room) return;

      // Determine new status based on tenant assignments
      const hasActiveTenants = room._count.Tenant > 0;
      const newStatus = hasActiveTenants ? constant.ROOM_OCCUPIED : constant.ROOM_AVAILABLE;

      // Only update if status has changed
      if (room.status !== newStatus) {
        await this.repository.dbClient.rooms.update({
          where: { id: roomId },
          data: { status: newStatus }
        });
      }
    } catch (error) {
      // Log error but don't throw to avoid breaking tenant operations
      console.error('Error updating room status:', error);
    }
  }
}

module.exports = new tenantService(tenantRepository);
