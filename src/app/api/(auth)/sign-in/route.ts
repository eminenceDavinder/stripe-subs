import { asyncHandler, generateResponseObject } from "@/helpers/common.helpers";
import { NextRequest } from "next/server";
import User from "@/models/user.model";
import { comparePassword, generateToken } from "@/helpers/auth.helpers";
import { StatusCodes } from "http-status-codes";
import { ResponseData } from "@/utils/types";
import { dbConnection } from "@/lib/dbConnection";

export async function POST(req: NextRequest){
    await dbConnection();
    const { email, password} = await req.json();
    const result = await asyncHandler( async (): Promise<string | ResponseData> => {
        const user = await User.findOne({ email });
        if (!user)
          return {
            error: 'Invalid Email',
            status_code: StatusCodes.BAD_REQUEST,
          };
        const isPassword = await comparePassword(password, user.password);
        if(!isPassword) return {
            error: 'Wrong Password',
            status_code: StatusCodes.BAD_REQUEST
        }
        return generateToken(
          user?._id as string,
        );
    });
    return generateResponseObject(
        {
            status_code: StatusCodes.OK,
            message: "Login successfully",
            data: {access_token: result, email: email}
        },
        result
    )
}