import { asyncHandler, generateResponseObject } from "@/helpers/common.helpers";
import { NextRequest } from "next/server";
import User from "@/models/user.model";
import { generateToken, hashPassword } from "@/helpers/auth.helpers";
import { StatusCodes } from "http-status-codes";
import { ResponseData } from "@/utils/types";
import { dbConnection } from "@/lib/dbConnection";

export async function POST(req: NextRequest){
    await dbConnection();
    const { email, fullname, password} = await req.json();
    const result = await asyncHandler( async (): Promise<string | ResponseData> => {
        const isExists = await User.findOne({ email });
        if (isExists)
          return {
            error: 'Email is already present',
            status_code: StatusCodes.BAD_REQUEST,
          };
        const hash_password = await hashPassword(password);
        const user = new User({ name: fullname, email, password : hash_password });
        const res = await user.save();
        return generateToken(
          res?._id as string,
        );
    });
    return generateResponseObject(
        {
            status_code: StatusCodes.OK,
            message: "Account created successfully",
            data: {access_token: result, email: email}
        },
        result
    )
}