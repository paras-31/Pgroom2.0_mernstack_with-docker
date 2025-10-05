const BaseRepository = require("./BasePrismaRepository");
const constant = require("../constant/Constant");
const { paginate } = require("../utils/Helper");

class userRepository {
  constructor() {
    this.baseRepository = new BaseRepository("userRoleLink");
  }

  #buildSearchConditions(searchInput, searchFields) {
    if (!searchInput) return undefined;

    // Split the search input by space to handle combined searches (e.g., "John Doe")
    const searchTerms = searchInput.trim().split(/\s+/);

    if (searchTerms.length === 1) {
      // Single term search - search in each field individually
      return searchFields.map((field) => ({
        [field]: { contains: searchInput, mode: "insensitive" },
      }));
    } else {
      // Multi-term search (e.g., first name + last name)
      const conditions = [];

      // Add condition for exact match on combined fields
      if (searchFields.includes("firstName") && searchFields.includes("lastName")) {
        conditions.push({
          AND: [
            { firstName: { contains: searchTerms[0], mode: "insensitive" } },
            { lastName: { contains: searchTerms[1], mode: "insensitive" } }
          ]
        });

        // Also add the reverse order condition (last name might be first)
        conditions.push({
          AND: [
            { firstName: { contains: searchTerms[1], mode: "insensitive" } },
            { lastName: { contains: searchTerms[0], mode: "insensitive" } }
          ]
        });
      }

      // Also include individual field searches for each term
      searchTerms.forEach(term => {
        searchFields.forEach(field => {
          conditions.push({
            [field]: { contains: term, mode: "insensitive" }
          });
        });
      });

      // Include the original full search string in each field
      searchFields.forEach(field => {
        conditions.push({
          [field]: { contains: searchInput, mode: "insensitive" }
        });
      });

      return conditions;
    }
  }

  #buildSelectedColumns(defaultColumns, additionalColumns) {
    return additionalColumns.reduce(
      (acc, column) => {
        acc[column] = true;
        return acc;
      },
      { ...defaultColumns }
    );
  }
  /**
   * function to get user ids by role id
   */
  async getUsersByRoleId(
    roleId,
    searchInput,
    searchFields,
    status,
    page,
    limit,
    additionalColumns = [],
    stateId = null,
    cityId = null
  ) {
    try {
      const defaultColumns = {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      };

      const searchConditions = this.#buildSearchConditions(searchInput, searchFields);
      const selectedColumns = this.#buildSelectedColumns(defaultColumns, additionalColumns);

      selectedColumns.state = { select: { stateName: true } };
      selectedColumns.city = { select: { cityName: true } };

      const userWhere = {
        ...(status ? { status } : { NOT: { status: "Deleted" } }),
        ...(stateId && { stateId }),
        ...(cityId && { cityId }),
        OR: searchConditions,
      };

      const queryOptions = {
        where: {
          roleId,
          user: userWhere,
        },
        select: {
          user: {
            select: selectedColumns,
          },
        },
      };

      return this.baseRepository.paginate(queryOptions, page, limit);
    } catch (error) {
      throw error;
    }
  }

  async getRecentTenants() {
    try {
      const prisma = this.baseRepository.getDBClient();
      return await prisma.user.findMany({
        where: {
          userRoleLink: {
            some: {
              roleId: constant.TENANT_ROLE_ID,
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * function to update user status
   */
  async updateUserStatus(userId, status) {
    try {
      const prisma = this.baseRepository.getDBClient();
      return await prisma.user.update({
        where: { id: userId },
        data: { status },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new userRepository();
