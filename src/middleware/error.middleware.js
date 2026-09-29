export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;

  console.error(
    `[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl} ${error.message}`
  );

  res.status(statusCode).json({
    success: false,
    error: error.message || "Internal server error"
  });
}