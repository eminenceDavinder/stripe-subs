import { authenticateToken } from "@/helpers/auth.helpers";
import { dbConnection } from "@/lib/dbConnection";
import Subscription from "@/models/subscription.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    dbConnection();
    const user = authenticateToken(request) as string;
    const result = await Subscription.findOne({userId : user, status: "active"}).sort({currentPeriodEnd: -1});
    if(result){
        return NextResponse.json({plan : result?.stripePriceId});
    }
    return NextResponse.json({plan : null});

}