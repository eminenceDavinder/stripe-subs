import { DecodedUser } from "@/utils/interfaces";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from "next/server";

export const authenticateToken = (
    req: NextRequest,
  ) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) 
      return NextResponse.json({ success: false, message: "Access token required" });
    try {
      const decodeUser = jwt.verify(
        token,
        process.env.SECRET_KEY as string,
      ) as DecodedUser;
      return decodeUser.userId;
    } catch (err) {
      if (err) return NextResponse.json({ success: false, message: "Invalid token" });
    }
  };
  
  export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };
  
  export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.SECRET_KEY as string);
  };
  
  export const comparePassword = async (
    password: string,
    hashPassword: string,
  ) => {
    return await bcrypt.compare(password, hashPassword);
  };
  