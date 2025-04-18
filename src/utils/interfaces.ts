import { NextApiRequest } from "next";

export interface DecodedUser {
  userId: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedUser;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
  }

  