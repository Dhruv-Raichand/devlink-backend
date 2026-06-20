import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export const asyncHandler =
  <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(
    fn: (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response<ResBody>,
      next: NextFunction
    ) => Promise<void>
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise.resolve(
      fn(req as Request<P, ResBody, ReqBody, ReqQuery>, res, next)
    ).catch(next);
  };
