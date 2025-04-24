import { authenticateToken } from "@/helpers/auth.helpers";
import { dbConnection } from "@/lib/dbConnection";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    dbConnection();
    const user = authenticateToken(request);
    const data = await User.findById(user);
    return NextResponse.json({isSubscribed: data?.stripe?.isActive});
}