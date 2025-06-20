import { z } from 'zod';

export const loginFormSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters')
});

export const registerFormSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
    email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
        .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;

export interface UserProfile {
  name: string
  avatarUrl: string
}

export interface PartnerDetails {
  name: string
  avatar: string
}

export interface SharedAccount {
  uuid: string
  user1Id: string
  user2Id?: string
  uniqueCode?: string
} 