export default {
  PORT: process.env.PORT || 8000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'blinkchat',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey_change_in_production'
};
