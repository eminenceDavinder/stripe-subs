import { findSubscribedPlanByUserId } from "@/lib/services/subscription.service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  return findSubscribedPlanByUserId(token as string);
}
