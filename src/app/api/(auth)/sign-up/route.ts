import { signUp } from "@/lib/services/user.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    const { email, fullname, password} = await req.json();
    return signUp(fullname, email, password);
}