const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const register = {
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: passwordSchema,
    roleId: objectId.optional(),
    phone: z.string().optional(),
  }),
};

const login = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

const refresh = {
  body: z.object({
    refreshToken: z.string().min(1).optional(),
  }),
};

const changePassword = {
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
  }),
};

const forgotPassword = {
  body: z.object({
    email: z.string().email(),
  }),
};

const resetPassword = {
  body: z.object({
    token: z.string().min(1),
    newPassword: passwordSchema,
  }),
};

module.exports = { register, login, refresh, changePassword, forgotPassword, resetPassword, objectId, passwordSchema };
