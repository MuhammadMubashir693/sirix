import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number');

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: passwordSchema,
  roleId: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  roleId: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
});
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});
export type RoleFormValues = z.infer<typeof roleSchema>;

export const permissionSchema = z.object({
  module: z
    .string()
    .min(1, 'Module is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage', 'export']),
  description: z.string().optional(),
});
export type PermissionFormValues = z.infer<typeof permissionSchema>;

export const settingSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .regex(/^[a-z0-9._-]+$/, 'Lowercase letters, numbers, dots, hyphens, underscores only'),
  value: z.string().min(1, 'Value is required'),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  group: z.string().min(1, 'Group is required'),
  description: z.string().optional(),
  isPublic: z.boolean(),
});
export type SettingFormValues = z.infer<typeof settingSchema>;
