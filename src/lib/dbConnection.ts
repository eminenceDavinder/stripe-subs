import logger from "@/logger";
import mongoose from "mongoose";
import 'dotenv/config';

export const dbConnection = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_KEY as string);
        logger.write('Database is connected successfully');
    }
    catch(err){
        logger.error(`Database is not connected ${err}`);
    }
}
