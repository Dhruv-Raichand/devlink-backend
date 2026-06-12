import { pinoHttp } from 'pino-http';
import { logger } from '../logger/logger.js';

export const requestLogger = pinoHttp({
  logger,
  customProps(req, res) {
    return {
      method: req.method,
      url: req.url,
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
