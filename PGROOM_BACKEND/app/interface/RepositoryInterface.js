class RepositoryInterface {
  /**
   * Creates a new record.
   */
  async create(data) {
    throw new Error("Method 'create' must be implemented.");
  }

  /**
   * Finds a record by ID.
   */
  async findById(id) {
    throw new Error("Method 'findById' must be implemented.");
  }

  /**
   * Updates a record.
   */
  async update(id, data) {
    throw new Error("Method 'update' must be implemented.");
  }

  /**
   * Deletes a record.
   */
  async delete(id) {
    throw new Error("Method 'delete' must be implemented.");
  }

  /**
   * Paginates records.
   */
  async paginate(queryOptions, page = 1, limit = 10) {
    throw new Error("Method 'paginate' must be implemented.");
  }

  /**
   * Upserts a record (updates if exists, creates if not).
   */
  async upsert(where, updateData, createData) {
    throw new Error("Method 'upsert' must be implemented.");
  }
}

module.exports = RepositoryInterface;
