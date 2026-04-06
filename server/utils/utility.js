export const pickFields = (obj, allowedFields) => {
  const result = {};
  allowedFields.forEach((field) => {
    if (obj[field] !== undefined) {
      result[field] = obj[field];
    }
  });
  return result;
};

/**
 * Validate if a value is a valid date string
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if valid date string, false otherwise
 */
export const isValidDateString = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Convert string to Date object if valid
 * @param {string} dateString - The date string to convert
 * @returns {Date|null} - Date object if valid, null otherwise
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) ? date : null;
};
