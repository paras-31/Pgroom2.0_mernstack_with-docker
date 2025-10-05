const { PrismaClient } = require("@prisma/client");
const RepositoryInterface = require("../interface/RepositoryInterface");

class BaseRepository  extends RepositoryInterface {
  constructor(prismaModel) {
    super();
    this.prisma = new PrismaClient();
    this.model = prismaModel;
    this.repository = this.prisma[prismaModel];
  }

  getDBClient() {
    return this.prisma;
  }

  /**
   * Generic function to create a record
   */
  async create(data) {
    try {
      return await this.repository.create({ data });
    } catch (error) {
      throw new Error(`Error creating ${this.model}: ${error.message}`);
    }
  }

  /**
   * Generic function to update or create a record
   */
  async upsert(where, updateData, createData) {
    try {
      return await this.repository.upsert({
        where,
        update: updateData,
        create: createData,
      });
    } catch (error) {
      throw new Error(`Error upserting ${this.model}: ${error.message}`);
    }
  }

  /**
   * Generic function to find a record by ID
   */
  async findById(id) {
    try {
      return await this.repository.findUnique({ where: { id } });
    } catch (error) {
      throw new Error(`Error finding ${this.model} by ID: ${error.message}`);
    }
  }

  /**
   * Generic function to update a record
   */
  async update(id, data) {
    try {
      return await this.repository.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Error updating ${this.model}: ${error.message}`);
    }
  }

  /**
   * Generic function to delete a record
   */
  async delete(id) {
    try {
      return await this.repository.delete({ where: { id } });
    } catch (error) {
      throw new Error(`Error deleting ${this.model}: ${error.message}`);
    }
  }

  /**
   * Generic function to paginate results
   */
  async paginate(queryOptions, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      return Promise.all([
        this.repository.findMany({
          ...queryOptions,
          skip,
          take: limit,
        }),
        this.repository.count({ where: queryOptions.where }),
      ]).then(([data, total]) => ({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }));
    } catch (error) {
      throw new Error(`Error paginating ${this.model}: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
