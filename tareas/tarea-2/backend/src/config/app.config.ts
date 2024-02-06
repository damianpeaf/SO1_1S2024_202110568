export const envConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'development',
  port: +process.env.PORT || 3001,
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017/tarea2',
});
