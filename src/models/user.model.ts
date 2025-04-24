import mongoose, { Schema, model, models } from "mongoose";
import { IUser } from "@/utils/interfaces";

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    stripe: {
      stripeCustomerId: { type: String, unique: true, sparse: true },
      isActive: { type: Boolean, default: false },
      paymentMethod: {
        type: String,
        enum: ["card", "paypal", "apple_pay", "google_pay"],
      }
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", userSchema);
