import { pinoHttp } from 'pino-http';
import { logger } from '../logger/logger.js';
import { Request } from 'express';

export const requestLogger = pinoHttp({
  logger,

  autoLogging: {
    ignore: (req) => req.url?.startsWith('/health') ?? false,
  },

  customProps(req) {
    const request = req as Request;
    return {
      requestId: request.requestId,
    };
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
