export default () => ({
  port:  process.env.PORT|| 3000,
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  database: {
    url: process.env.DATABASE_URL,
  },
});
