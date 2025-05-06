import User from "@lib/models/user.model";
import mongoose from "mongoose";
import {
  authenticateToken,
  comparePassword,
  generateToken,
  hashPassword,
} from "@lib//helpers/authentication.helpers";
import {
  asyncHandlerForOperations,
  generateResponseObject,
} from "@lib/helpers/common.helpers";
import { StatusCodes } from "http-status-codes";
import { ResponseData } from "@lib/types";
import { dbConnection } from "@lib/dbConnection";
await dbConnection();

export const findUserIdByEmail = async (
  email: string
): Promise<mongoose.Types.ObjectId | string> => {
  const user = await User.findOne({ email: email });
  return user?._id;
};

export const getCustomerId = async (token: string) => {
  const user = await authenticateToken(token);
  const { stripe } = await User.findById({ _id: user as string });
  return stripe.stripeCustomerId;
};

export const getUserById = async (_id: string) => {
  return await User.findById({ _id });
};

export const signIn = async (email: string, password: string) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      const user = await User.findOne({ email });
      if (!user)
        return {
          error: "Invalid Email",
          status_code: StatusCodes.BAD_REQUEST,
        };
      const isPassword = await comparePassword(password, user.password);
      if (!isPassword)
        return {
          error: "Wrong Password",
          status_code: StatusCodes.BAD_REQUEST,
        };
      const access_token = generateToken(user?._id as string);
      return {
        data: { access_token, email: email },
        message: "Login successfully",
        status_code: StatusCodes.OK,
      };
    },
    "DATABASE_ERROR, An error occurred while processing your request",
    StatusCodes.FORBIDDEN
  );
  return generateResponseObject(result as ResponseData);
};

export const signUp = async (
  fullname: string,
  email: string,
  password: string
) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      const isExists = await User.findOne({ email });
      if (isExists)
        return {
          error: "Email is already present",
          status_code: StatusCodes.BAD_REQUEST,
        };
      const hash_password = await hashPassword(password);
      const user = new User({
        name: fullname,
        email,
        password: hash_password,
        stripe: { isActive: false },
      });
      const res = await user.save();
      const access_token = generateToken(res?._id as string);
      return {
        status_code: StatusCodes.OK,
        message: "Account created successfully",
        data: { access_token: access_token, email: email },
      };
    },
    "DATABASE_ERROR, An error occurred while processing your request",
    StatusCodes.FORBIDDEN
  );
  return generateResponseObject(result as ResponseData);
};

export const isSubscribed = async (token: string) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      const user = await authenticateToken(token);
      const data = await User.findById(user);
      return { data: { isSubscribed: data?.stripe?.isActive } };
    },
    "DATABASE_ERROR, An error occurred while processing your request",
    StatusCodes.FORBIDDEN
  );
  return generateResponseObject(result as ResponseData);
};

export const updateUserSubscription = async (
  userId: string,
  stripeCustomerId: string,
  currency: string,
  status: string
) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            "stripe.stripeCustomerId": stripeCustomerId,
            "stripe.paymentMethod": currency,
            "stripe.isActive": status.toLowerCase() === "active" ? true : false,
          },
        },
        { new: true }
      );
      return;
    },
    "DATABASE_ERROR, An error occurred while processing your request",
    StatusCodes.FORBIDDEN
  );
  const error = (result as ResponseData)?.error ?? null;
  if (error) return generateResponseObject(result as ResponseData);
};

export const cancelUserSubscription = async (userId: string) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            "stripe.isActive": false,
          },
        },
        { new: true }
      );
      return;
    },
    "DATABASE_ERROR, An error occurred while processing your request",
    StatusCodes.FORBIDDEN
  );
  const error = (result as ResponseData)?.error ?? null;
  if (error) return generateResponseObject(result as ResponseData);
};
