import { Request } from 'express';

export interface SignupBody {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
}

export interface LoginBody {
  emailId: string;
  password: string;
}

export type SignupRequest = Request<{}, {}, SignupBody>;
export type LoginRequest = Request<{}, {}, LoginBody>;
