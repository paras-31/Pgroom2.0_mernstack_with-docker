const constant = require("../constant/Constant");
const propertyRepository = require("../repository/PropertyRepository");
const roomRepository = require("../repository/RoomRepository");
const tenantRepository = require("../repository/TenantRepository");
const userRepository = require("../repository/UserRepository");

class DashBoardService {
  constructor() {
      this.propertyRepository = new propertyRepository();
      this.roomRepository = roomRepository;
      this.tenantRepository = tenantRepository;
      this.userRepository = userRepository;
  }
    
    async getMonitoringCards(req) {
        try {
            const userId = req?.authUser?.userId;

            const propertyCount = await this.propertyRepository.getPropertyCount(userId);

            const propertyIds = await this.propertyRepository.getAllPropertiesIds(userId);

            const roomCount = await this.roomRepository.getRoomCount(propertyIds);

            const roomIds = await this.roomRepository.getAllRoomsIds(propertyIds);
          
            const assignedTenantsCount = await this.tenantRepository.getAssignedTenantsCount(roomIds, constant.ACTIVE);

            const expectedMonthlyIncome = await this.roomRepository.getExpectedMonthlyIncome(propertyIds);

            return {
                totalProperties: propertyCount,
                totalRooms: roomCount,
                totalAssignedTenants: assignedTenantsCount,
                expectedMonthlyIncome : expectedMonthlyIncome
            };
        } catch (error) {
            throw error;
        }
    }

    async getRecentTenants() {
        try {
            return await this.userRepository.getRecentTenants();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DashBoardService;
