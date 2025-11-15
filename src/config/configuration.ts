// src/config/configuration.ts
export default () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    database: {
      url: process.env.DATABASE_URL,
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
    },
    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
    oauth: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
  });
  