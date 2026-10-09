/**
 * Consistent API Response Helper Functions
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, statusCode = 200, message = 'Success', data = [], pagination = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
    },
  });
};

const errorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
