const request = require('supertest');
const app = require('../../app');
const env = require('../../config/env');
const { seedViewerRole, createTestUser } = require('../helpers/seedTestData');
const Permission = require('../../models/Permission');
const Role = require('../../models/Role');
const Invoice = require('../../models/Invoice');
const Payment = require('../../models/Payment');
const CarrierPayment = require('../../models/CarrierPayment');

const base = env.apiPrefix;

describe('Reports endpoints', () => {
  let accessToken;

  beforeEach(async () => {
    await seedViewerRole();

    const perm = await Permission.create({ key: 'reports:read', module: 'reports', action: 'read' });
    const role = await Role.create({ name: 'Reporter', permissions: [perm._id], isSystem: false });
    const user = await createTestUser({ email: 'reports@example.com', password: 'Password123', role: role._id });

    const loginRes = await request(app)
      .post(`${base}/auth/login`)
      .send({ email: user.email, password: 'Password123' });

    accessToken = loginRes.body.data.accessToken;
  });

  it('returns grouped revenue, profit, and entity reports', async () => {
    const invoice = await Invoice.create({
      invoiceNumber: 'INV-001',
      customer: '507f191e810c19729de860ea',
      carrier: '507f191e810c19729de860eb',
      dueDate: new Date('2026-08-30T00:00:00.000Z'),
      lineItems: [{ description: 'Usage', quantity: 1, unitPrice: 100, amount: 100 }],
      subtotal: 100,
      totalAmount: 100,
      amountPaid: 0,
      status: 'pending',
    });

    await Payment.create({
      paymentNumber: 'PMT-001',
      invoice: invoice._id,
      customer: invoice.customer,
      amount: 100,
      method: 'bank_transfer',
      status: 'completed',
      paidAt: new Date('2026-08-02T00:00:00.000Z'),
    });

    await CarrierPayment.create({
      paymentNumber: 'CPY-001',
      carrier: invoice.carrier,
      vendor: '507f191e810c19729de860ec',
      amount: 40,
      method: 'wire',
      status: 'completed',
      paidAt: new Date('2026-08-03T00:00:00.000Z'),
    });

    const revenueRes = await request(app)
      .get(`${base}/reports/revenue`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(revenueRes.status).toBe(200);
    expect(revenueRes.body.data.totalRevenue).toBe(100);
    expect(revenueRes.body.data.periods).toBeDefined();

    const profitRes = await request(app)
      .get(`${base}/reports/profit`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(profitRes.status).toBe(200);
    expect(profitRes.body.data.totalProfit).toBe(60);

    const customerRes = await request(app)
      .get(`${base}/reports/customers`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(customerRes.status).toBe(200);
    expect(customerRes.body.data.items.length).toBeGreaterThan(0);

    const carrierRes = await request(app)
      .get(`${base}/reports/carriers`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(carrierRes.status).toBe(200);
    expect(carrierRes.body.data.items.length).toBeGreaterThan(0);

    const vendorRes = await request(app)
      .get(`${base}/reports/vendors`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(vendorRes.status).toBe(200);
    expect(vendorRes.body.data.items.length).toBeGreaterThan(0);
  });
});
