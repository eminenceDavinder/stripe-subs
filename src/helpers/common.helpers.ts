import { ResponseData } from "@/utils/types";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";


export const generateResponseObject = (
    result: ResponseData,
    asyncHandlerResponse: ResponseData | null,
  ) => {
    if (asyncHandlerResponse?.error) {
      return NextResponse.json({
        success: false,
        message: asyncHandlerResponse.error,
        result: null,
      }, {
        status: asyncHandlerResponse.status_code,
      });
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      result: result?.data,
    }, {
      status: asyncHandlerResponse?.status_code
    });
  };
  
  export const asyncHandler = async <T>(
    fn: () => Promise<T>,
  ): Promise<{ error?: string; message?: string } | unknown> => {
    try {
      return await fn();
    } catch (error) {
      console.error('Error executing async function', error);
      return {
        error: 'DATABASE_ERROR, An error occurred while processing your request',
        status_code: StatusCodes.FORBIDDEN,
      };
    }
  };
  