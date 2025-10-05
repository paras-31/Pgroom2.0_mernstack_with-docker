const BaseRepository = require("./BasePrismaRepository");
const constant = require("../constant/Constant");

class PropertyRepository {
  constructor() {
    this.baseRepository = new BaseRepository("userProperties");
  }

  /**
   * Function to add or update a property
   */
  async addOrUpdateProperty(
    userId,
    stateId,
    cityId,
    propertyName,
    propertyImage,
    propertyContact,
    propertyAddress,
    status,
    id = null
  ) {
    try {
      const propertyData = {
        userId,
        stateId,
        cityId,
        propertyName,
        propertyImage,
        propertyContact,
        propertyAddress,
        status,
      };

      // Delegate to BaseRepository's create or upsert methods
      return id === null
        ? this.baseRepository.create(propertyData)
        : this.baseRepository.upsert({ id }, propertyData, propertyData);
    } catch (error) {
      throw new Error(`Error adding or updating property: ${error.message}`);
    }
  }

  /**
   * Function to get all properties with pagination
   */
  async getAllProperties(userId = null, page, limit, cityId = null , stateId = null, search = null, status = constant.ACTIVE) {
    try {
      const whereClause = {
        ...(userId && { userId }), // Only add userId filter if provided
        status,
        ...(cityId && { cityId }),
        ...(stateId && { stateId }),
        ...(search && {
          propertyName: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      };

      const queryOptions = {
       where: whereClause,
        include: {
          state: {
            select: { stateName: true },
          },
          city: {
            select: { cityName: true },
          },
        },
        orderBy: {
          id: "asc",
        },
      };

      // Use BaseRepository's paginate method
      return this.baseRepository.paginate(queryOptions, page, limit);
    } catch (error) {
      throw new Error(`Error fetching properties: ${error.message}`);
    }
  }

  /**
   * Function to update the status of a property
   */
  async updatePropertyStatus(id, status) {
    try {
      // Delegate to BaseRepository's update method
      return this.baseRepository.update(id, { status });
    } catch (error) {
      throw new Error(`Error updating property status: ${error.message}`);
    }
  }
async getPropertyCount(userId) {
  try {
    const whereClause = {
      status: {
        not: constant.DELETED,
      },
    };
    
    // Add userId filter only if userId is provided (not null/undefined)
    if (userId !== null && userId !== undefined) {
      whereClause.userId = userId;
    }
    
    return await this.baseRepository.getDBClient().userProperties.count({
      where: whereClause,
    });
  } catch (error) {
    throw new Error(`Error fetching property count: ${error.message}`);
  }
}
  async getAllPropertiesIds(userId) {
    try {
      return await this.baseRepository.getDBClient().userProperties.findMany({
        where: {
          userId,
          status: {
            not: constant.DELETED,
          },
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching property IDs: ${error.message}`);
    }
  }

  /**
   * Function to get all properties for admin with enhanced data
   */
  async getAllPropertiesForAdmin(page, limit, cityId = null, stateId = null, search = null, status = null) {
    try {
      const whereClause = {
        status: status ? status : { not: constant.DELETED },
        ...(cityId && { cityId }),
        ...(stateId && { stateId }),
        ...(search && {
          propertyName: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      };

      const queryOptions = {
        where: whereClause,
        include: {
          state: {
            select: { stateName: true },
          },
          city: {
            select: { cityName: true },
          },
          user: {
            select: { 
              firstName: true, 
              lastName: true,
              email: true, 
              mobileNo: true 
            },
          },
          rooms: {
            select: {
              status: true,
              rent: true,
              _count: {
                select: {
                  Tenant: {
                    where: {
                      status: constant.ACTIVE
                    }
                  }
                }
              }
            },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      };

      // Use BaseRepository's paginate method
      return this.baseRepository.paginate(queryOptions, page, limit);
    } catch (error) {
      throw new Error(`Error fetching admin properties: ${error.message}`);
    }
  }

  /**
   * Function to get property statistics for admin
   */
  async getPropertyStatistics() {
    try {
      const dbClient = this.baseRepository.getDBClient();

      // Get total properties count
      const totalProperties = await dbClient.userProperties.count({
        where: {
          status: { not: constant.DELETED },
        },
      });

      // Get active properties count
      const activeProperties = await dbClient.userProperties.count({
        where: {
          status: constant.ACTIVE,
        },
      });

      // Get total rooms count (excluding deleted)
      const totalRooms = await dbClient.rooms.count({
        where: {
          status: { not: "Deleted" },
        },
      });

      // Get rooms and calculate monthly revenue
      const roomsWithTenants = await dbClient.rooms.findMany({
        where: {
          status: { not: "Deleted" },
        },
        select: {
          rent: true,
          _count: {
            select: {
              Tenant: {
                where: {
                  status: constant.ACTIVE
                }
              }
            }
          }
        },
      });

      // Calculate monthly revenue based on active tenant assignments
      const roomsWithActiveTenants = roomsWithTenants.filter(room => room._count.Tenant > 0);
      
      const monthlyRevenue = roomsWithActiveTenants.reduce((total, room) => {
        return total + (parseFloat(room.rent) || 0);
      }, 0);

      // Calculate occupancy rate
      const occupancyRate = totalRooms > 0 ? Math.round((roomsWithActiveTenants.length / totalRooms) * 100) : 0;

      return {
        totalProperties,
        activeProperties,
        totalRooms,
        monthlyRevenue,
        occupancyRate,
      };
    } catch (error) {
      throw new Error(`Error fetching property statistics: ${error.message}`);
    }
  }

  /**
   * Function to get recent properties for admin dashboard
   */
  async getRecentProperties(limit = 5) {
    try {
      const dbClient = this.baseRepository.getDBClient();

      const recentProperties = await dbClient.userProperties.findMany({
        where: {
          status: { not: constant.DELETED },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        select: {
          id: true,
          propertyName: true,
          createdAt: true,
          status: true,
        },
      });

      return recentProperties;
    } catch (error) {
      throw new Error(`Error fetching recent properties: ${error.message}`);
    }
  }
}

module.exports = PropertyRepository;