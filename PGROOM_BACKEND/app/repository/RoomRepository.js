const BaseRepository = require("./BasePrismaRepository");
const constant = require("../constant/Constant");

class roomRepository {
  constructor() {
    this.baseRepository = new BaseRepository("rooms");
  }

  /**
   * Function to add or update a room
   */
  async addOrUpdateRoom(
    propertyId,
    roomNo,
    roomImage,
    totalBed,
    status,
    description,
    rent,
    id = null
  ) {
    try {
      const roomData = {
        propertyId,
        roomNo,
        roomImage,
        totalBed,
        status,
        description,
        rent,
      };

      // If `id` is null, create a new property
      return id === null
        ? this.baseRepository.create(roomData)
        : this.baseRepository.upsert({ id }, roomData, roomData);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Function to get all rooms
   */
  async getAllRooms(propertyId ,page, limit, status = constant.ROOM_AVAILABLE) {
    try {
      const queryOptions = {
        where: {
          propertyId: propertyId,
          status: status,
        },
        include: {
          Tenant: {
            where: { status: constant.ACTIVE },
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          id: "asc",
        },
      };
      return this.baseRepository.paginate(queryOptions, page, limit);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Function to get a room by ID
   */
  async getRoom(roomId) {
    try {
      const prisma = this.baseRepository.getDBClient();
    return await prisma.rooms.findUnique({
        where: { id: roomId },
        include: {
          Tenant: {
            where: { status: constant.ACTIVE },
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Function to update the status of a room
   */
  async updateRoomStatus(roomId, status) {
    try {
      return this.baseRepository.update(roomId, { status : status });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getRoomCount(propertyIds) {
    try {
      return await this.baseRepository.getDBClient().rooms.count({
        where: {
          propertyId: {
            in: propertyIds.map((property) => property.id),
          },
          status: {
            not: constant.DELETED,
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching room count: ${error.message}`);
    }
  }
  async getAllRoomsIds(propertyIds) {
    try {
      return await this.baseRepository.getDBClient().rooms.findMany({
        where: {
          propertyId: {
            in: propertyIds.map((property) => property.id),
          },
          status: {
            not: constant.DELETED,
          },
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching room IDs: ${error.message}`);
    }
  }
  
  async getExpectedMonthlyIncome(propertyIds) {
    try {
      const prisma = this.baseRepository.getDBClient();
      const rooms = await prisma.rooms.findMany({
        where: {
          propertyId: {
            in: propertyIds.map((property) => property.id),
          },
          status: { not: constant.DELETED },
        },
        select: { rent: true, totalBed: true },
      });

      return rooms.reduce((sum, room) => {
        const rent = parseFloat(room.rent);
        const totalBed = room.totalBed || 0;
        const income = (isNaN(rent) ? 0 : rent) * totalBed;
        return sum + income;
      }, 0);
    } catch (error) {
      throw new Error(`Error fetching expected income: ${error.message}`);
    }
  }

  /**
   * Function to get rooms by property ID
   */
  async getRoomsByPropertyId(propertyId) {
    try {
      const prisma = this.baseRepository.getDBClient();
      return await prisma.rooms.findMany({
        where: {
          propertyId: propertyId,
          status: { not: constant.DELETED },
        },
        select: {
          id: true,
          roomNo: true,
          rent: true,
          status: true,
          totalBed: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching rooms: ${error.message}`);
    }
  }
}

module.exports = new roomRepository();
