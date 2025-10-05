class DataParseHelper {
  /**
   * Parses and validates input data with type conversions
   */
  parseInputData = (data, {
    integerFields = [],
    integerArrayFields = []
  } = {}) => {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeError('Input must be a non-null object');
    }

    const result = { ...data };

    integerFields.forEach(field => {
      if (field in result && result[field] !== undefined) {
        result[field] = this.#parseToInteger(result[field], field);
      }
    });

    integerArrayFields.forEach(field => {
      if (field in result && result[field] !== undefined) {
        result[field] = this.#parseToIntegerArray(result[field], field);
      }
    });

    return result;
  };

  /**
   * Converts a value to an integer with validation
   */
  #parseToInteger = (value, fieldName) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || !Number.isFinite(parsed)) {
      throw new RangeError(`Field '${fieldName}' must be a valid integer, got '${value}'`);
    }
    return parsed;
  };

  /**
   * Converts an array of values to integers
   */
  #parseToIntegerArray = (value, fieldName) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item, index) => {
      return this.#parseToInteger(item, `${fieldName}[${index}]`);
    });
  };
}

module.exports = new DataParseHelper();
