/**
 * Standard ApiResponse helper matching Spring Boot / Frontend contracts
 */
function apiResponse(res, statusCode, success, message, data = null) {
  return res.status(statusCode).json({
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Standard PageResponse helper matching Spring Data Page<T> format
 */
function pageResponse(content, page, size, totalElements) {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    page: Number(page),
    size: Number(size),
    totalElements: Number(totalElements),
    totalPages: totalPages === 0 ? 1 : totalPages,
    last: Number(page) >= totalPages - 1,
  };
}

module.exports = {
  apiResponse,
  pageResponse,
};
