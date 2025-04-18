import { AuthenticatedRequest, DecodedUser } from "@/utils/interfaces";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { NextApiResponse } from "next";

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) 
      return res.status(401).json({ success: false, message: "Access token required" });
    try {
      const decodeUser = jwt.verify(
        token,
        process.env.SECRET_KEY as string,
      ) as DecodedUser;
      req.user = decodeUser;
      next();
    } catch (err) {
      if (err) return res.status(403).json({ success: false, message: "Invalid token" });
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
  