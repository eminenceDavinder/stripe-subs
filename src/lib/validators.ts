import {z} from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(32, 'Password cannot exceed 32 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[\W_]/, 'Password must contain at least one special character');

export const AuthRequestBody = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters').optional(),
  email: z.string().email('Invalid email'),
  password: passwordSchema,
});
