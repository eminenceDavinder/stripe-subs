import { NextRequest } from "next/server";
import { signIn } from "@/lib/services/user.service";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  return signIn(email, password);
}
