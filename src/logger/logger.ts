import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  redact: {
    paths: [
      'password',
      'refreshToken',
      'accessToken',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    remove: true,
  },

  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid, hostname',
      },
    },
  }),
});
