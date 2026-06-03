export const env = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-jwt-refresh-secret",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:1999",
  nodeEnv: process.env.NODE_ENV || "development",
};
