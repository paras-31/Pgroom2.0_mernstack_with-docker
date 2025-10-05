const { PrismaClient } = require("@prisma/client");

class ApiService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Function to get all states
   */
  async getAllStates(req) {
    try {
      const states = await this.prisma.state.findMany({
        select: {
          id: true,
          stateName: true,
        },
      });
      return states;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Function to get all cities according to state ID
   */
  async getCities(req, res) {
    try {
      const cities = await this.prisma.city.findMany({
        where: {
          stateId: parseInt(req.params.id),
        },
        select: {
          id: true,
          cityName: true,
        },
      });
      return cities;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = ApiService;
