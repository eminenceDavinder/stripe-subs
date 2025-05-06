import { ResponseData, StripeEvent } from "@lib/types";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import logger from "@lib/logger";

const generateResponse = (
  success: boolean,
  message: string,
  result: unknown,
  status_code?: number
) => {
  return NextResponse.json(
    {
      success: success,
      message: message,
      result: result,
    },
    {
      status: status_code,
    }
  );
};

export const generateResponseObject = (result: ResponseData) => {
  if (result?.error) {
    return generateResponse(false, result.error, null, result?.status_code);
  }
  return generateResponse(
    true,
    result?.message as string,
    result.data,
    StatusCodes.OK
  );
};

export const asyncHandlerForOperations = async <T>(
  fn: () => Promise<T>,
  errorMessage: string,
  status_code: number
): Promise<ResponseData | StripeEvent | unknown> => {
  try {
    return await fn();
  } catch (error) {
    logger.error("Error executing async function for operation", error);
    return {
      error: errorMessage,
      status_code: status_code,
    };
  }
};

