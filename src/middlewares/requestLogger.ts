import { pinoHttp } from 'pino-http';
import { logger } from '../logger/logger.js';
import { Request } from 'express';

export const requestLogger = pinoHttp({
  logger,

  customProps(req, res) {
    const request = req as Request;
    return {
      requestId: request.requestId,
      method: request.method,
      url: request.url,
      statusCode: res.statusCode,
    };
  },

  serializers: {
    req(req) {
      return undefined;
    },

    res(res) {
      return undefined;
    },
  },
});
