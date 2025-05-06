import logger from "@/lib/logger";
import mongoose from "mongoose";

export const dbConnection = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_KEY as string);
        logger.write('Database is connected successfully');
    }
    catch(err){
        logger.error(`Database is not connected ${err}`);
    }
}
