// src/config/configuration.ts
export default () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      url: process.env.DATABASE_URL,
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
    },
    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  });
  