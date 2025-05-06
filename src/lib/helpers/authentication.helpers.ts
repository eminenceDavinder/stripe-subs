import { DecodedUser } from "@lib/interfaces";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandlerForOperations, generateResponseObject } from "./common.helpers";
import { ResponseData } from "../types";
import { StatusCodes } from "http-status-codes";

export const authenticateToken = async (token: string) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      if (!token) return { error: "Access token required", status_code : StatusCodes.BAD_REQUEST };
      const decodeUser = jwt.verify(
        token,
        process.env.SECRET_KEY as string
      ) as DecodedUser;
      return decodeUser.userId;
    },
    "Invalid token", StatusCodes.BAD_REQUEST
  );

  if (result as string) {
    return result;
  }
  return generateResponseObject(result as ResponseData);
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.SECRET_KEY as string);
};

export const comparePassword = async (
  password: string,
  hashPassword: string
) => {
  return await bcrypt.compare(password, hashPassword);
};
