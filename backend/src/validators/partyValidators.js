const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const status = z.enum(['active', 'inactive', 'suspended']);

const listQuery = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: status.optional(),
  }),
};

const idParam = { params: z.object({ id: objectId }) };

const customerBody = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  status: status.optional(),
  notes: z.string().optional(),
});

// Carriers and vendors are keyed by a short uppercase code instead of an email.
const carrierBody = z.object({
  name: z.string().trim().min(1),
  code: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(/^[a-zA-Z0-9]+$/, 'Letters and numbers only'),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  status: status.optional(),
  notes: z.string().optional(),
});

module.exports = {
  listQuery,
  idParam,
  createCustomer: { body: customerBody },
  updateCustomer: { params: idParam.params, body: customerBody.partial() },
  createCarrier: { body: carrierBody },
  updateCarrier: { params: idParam.params, body: carrierBody.partial() },
};
