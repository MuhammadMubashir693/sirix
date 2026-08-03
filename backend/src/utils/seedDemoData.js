/* eslint-disable no-console */
/**
 * Demo data seeder for the accounting and reports modules.
 *
 * `npm run seed` only creates permissions, roles and the admin user, so the
 * Accounting and Reports screens are legitimately empty on a fresh database.
 * This script fills them with a realistic, deterministic dataset (customers,
 * carriers, vendors, invoices, customer payments and carrier payments) so the
 * revenue / expense / outstanding figures and every table have something to
 * show. Re-running it is safe: records are matched by their natural key and
 * updated in place rather than duplicated.
 *
 *   npm run seed:demo            # add demo data
 *   npm run seed:demo -- --reset # delete existing demo data first
 */
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const Customer = require('../models/Customer');
const Carrier = require('../models/Carrier');
const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const CarrierPayment = require('../models/CarrierPayment');

const CUSTOMERS = [
  { name: 'Northwind Telecom', email: 'billing@northwindtelecom.example', company: 'Northwind Telecom LLC', phone: '+1-202-555-0141' },
  { name: 'Helios Voice', email: 'ap@heliosvoice.example', company: 'Helios Voice SA', phone: '+34-910-555-022' },
  { name: 'Kestrel Communications', email: 'finance@kestrelcomms.example', company: 'Kestrel Communications Ltd', phone: '+44-20-7555-0173' },
  { name: 'Sable Networks', email: 'accounts@sablenetworks.example', company: 'Sable Networks Inc', phone: '+1-415-555-0188' },
];

const CARRIERS = [
  { name: 'Atlas Carrier', code: 'ATLAS', email: 'noc@atlascarrier.example' },
  { name: 'Meridian Routes', code: 'MERID', email: 'noc@meridianroutes.example' },
  { name: 'Orion Transit', code: 'ORION', email: 'noc@oriontransit.example' },
];

const VENDORS = [
  { name: 'Pinecone Wholesale', code: 'PINE', email: 'billing@pineconewholesale.example' },
  { name: 'Vertex Interconnect', code: 'VRTX', email: 'billing@vertexic.example' },
];

/** Invoice templates: `monthsAgo` anchors each record to a recent month. */
const INVOICES = [
  { number: 'INV-1001', customer: 0, carrier: 0, monthsAgo: 3, status: 'paid', currency: 'USD', tax: 1_820, lineItems: [
    { description: 'Wholesale A-Z voice termination — 1.42M minutes', quantity: 1_420_000, unitPrice: 0.0154 },
    { description: 'SIP trunk rental (40 channels)', quantity: 40, unitPrice: 12 },
  ] },
  { number: 'INV-1002', customer: 1, carrier: 1, monthsAgo: 3, status: 'paid', currency: 'USD', tax: 940, lineItems: [
    { description: 'Premium European termination — 610k minutes', quantity: 610_000, unitPrice: 0.0189 },
  ] },
  { number: 'INV-1003', customer: 2, carrier: 0, monthsAgo: 2, status: 'partially_paid', currency: 'USD', tax: 1_240, discount: 500, lineItems: [
    { description: 'Wholesale A-Z voice termination — 980k minutes', quantity: 980_000, unitPrice: 0.0161 },
    { description: 'DID numbering block (UK, 1000 numbers)', quantity: 1_000, unitPrice: 0.65 },
  ] },
  { number: 'INV-1004', customer: 3, carrier: 2, monthsAgo: 2, status: 'overdue', currency: 'USD', tax: 660, lineItems: [
    { description: 'CLI-guaranteed routes — 430k minutes', quantity: 430_000, unitPrice: 0.0212 },
  ] },
  { number: 'INV-1005', customer: 0, carrier: 1, monthsAgo: 1, status: 'paid', currency: 'USD', tax: 1_510, lineItems: [
    { description: 'Wholesale A-Z voice termination — 1.18M minutes', quantity: 1_180_000, unitPrice: 0.0157 },
    { description: 'SMS A2P delivery — 240k messages', quantity: 240_000, unitPrice: 0.0075 },
  ] },
  { number: 'INV-1006', customer: 1, carrier: 2, monthsAgo: 1, status: 'pending', currency: 'USD', tax: 780, lineItems: [
    { description: 'Premium European termination — 520k minutes', quantity: 520_000, unitPrice: 0.0193 },
  ] },
  { number: 'INV-1007', customer: 2, carrier: 1, monthsAgo: 0, status: 'pending', currency: 'USD', tax: 1_050, lineItems: [
    { description: 'Wholesale A-Z voice termination — 840k minutes', quantity: 840_000, unitPrice: 0.0165 },
  ] },
  { number: 'INV-1008', customer: 3, carrier: 0, monthsAgo: 0, status: 'draft', currency: 'USD', tax: 0, lineItems: [
    { description: 'Interconnect setup fee', quantity: 1, unitPrice: 2_500 },
  ] },
];

/**
 * Customer payments. `fraction` is the share of the invoice total that was
 * collected, so an invoice's status and its payments never contradict.
 */
const PAYMENTS = [
  { number: 'PAY-2001', invoice: 'INV-1001', fraction: 1, method: 'bank_transfer', status: 'completed', reference: 'FT2024-88112' },
  { number: 'PAY-2002', invoice: 'INV-1002', fraction: 1, method: 'wire', status: 'completed', reference: 'WIRE-55231' },
  { number: 'PAY-2003', invoice: 'INV-1003', fraction: 0.45, method: 'bank_transfer', status: 'completed', reference: 'FT2024-90417' },
  { number: 'PAY-2004', invoice: 'INV-1005', fraction: 1, method: 'card', status: 'completed', reference: 'CARD-7741' },
  { number: 'PAY-2005', invoice: 'INV-1006', fraction: 0.3, method: 'bank_transfer', status: 'pending', reference: 'FT2024-91880' },
];

/**
 * Carrier payments. Each one names both the carrier whose traffic it settles and
 * the wholesale vendor it was paid through, so the vendor report isn't full of
 * "Unassigned vendor" rows.
 */
const CARRIER_PAYMENTS = [
  { number: 'CPY-3001', carrier: 0, vendor: 0, monthsAgo: 3, amount: 12_400, method: 'bank_transfer', status: 'completed', reference: 'ATLAS-2024-03' },
  { number: 'CPY-3002', carrier: 1, vendor: 1, monthsAgo: 2, amount: 8_950, method: 'wire', status: 'completed', reference: 'MERID-2024-04' },
  { number: 'CPY-3003', vendor: 0, monthsAgo: 2, amount: 6_300, method: 'bank_transfer', status: 'completed', reference: 'PINE-2024-04' },
  { number: 'CPY-3004', carrier: 2, vendor: 1, monthsAgo: 1, amount: 5_180, method: 'bank_transfer', status: 'completed', reference: 'ORION-2024-05' },
  { number: 'CPY-3005', vendor: 1, monthsAgo: 1, amount: 4_720, method: 'wire', status: 'completed', reference: 'VRTX-2024-05' },
  { number: 'CPY-3006', carrier: 0, vendor: 0, monthsAgo: 0, amount: 9_640, method: 'bank_transfer', status: 'pending', reference: 'ATLAS-2024-06' },
];

const round2 = (value) => Math.round(value * 100) / 100;

/** Day `day` of the month `monthsAgo` months before today, at midday UTC. */
function dateInMonth(monthsAgo, day) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, day, 12, 0, 0));
}

function buildInvoiceDoc(template, customerId, carrierId) {
  const lineItems = template.lineItems.map((item) => ({
    ...item,
    amount: round2(item.quantity * item.unitPrice),
  }));
  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.amount, 0));
  const tax = template.tax || 0;
  const discount = template.discount || 0;
  const totalAmount = round2(subtotal + tax - discount);
  const paidFraction = PAYMENTS.filter(
    (p) => p.invoice === template.number && p.status === 'completed'
  ).reduce((sum, p) => sum + p.fraction, 0);

  return {
    invoiceNumber: template.number,
    customer: customerId,
    carrier: carrierId,
    issueDate: dateInMonth(template.monthsAgo, 4),
    dueDate: dateInMonth(template.monthsAgo - 1, 4),
    lineItems,
    subtotal,
    tax,
    discount,
    totalAmount,
    amountPaid: round2(totalAmount * paidFraction),
    currency: template.currency,
    status: template.status,
    notes: 'Demo data — created by `npm run seed:demo`.',
  };
}

/** Upserts by natural key so the seeder can be re-run without duplicating rows. */
async function upsert(Model, query, doc) {
  const existing = await Model.findOne(query);
  if (existing) {
    existing.set(doc);
    await existing.save();
    return existing;
  }
  return Model.create(doc);
}

async function reset() {
  const invoiceNumbers = INVOICES.map((i) => i.number);
  await Payment.deleteMany({ paymentNumber: { $in: PAYMENTS.map((p) => p.number) } });
  await CarrierPayment.deleteMany({ paymentNumber: { $in: CARRIER_PAYMENTS.map((p) => p.number) } });
  await Invoice.deleteMany({ invoiceNumber: { $in: invoiceNumbers } });
  await Customer.deleteMany({ email: { $in: CUSTOMERS.map((c) => c.email) } });
  await Carrier.deleteMany({ code: { $in: CARRIERS.map((c) => c.code) } });
  await Vendor.deleteMany({ code: { $in: VENDORS.map((v) => v.code) } });
  console.log('Removed previously seeded demo records.');
}

async function seedDemoData() {
  await connectDB();

  if (process.argv.includes('--reset')) await reset();

  const customers = [];
  for (const customer of CUSTOMERS) {
    customers.push(await upsert(Customer, { email: customer.email }, { ...customer, status: 'active' }));
  }
  console.log(`Customers: ${customers.length}`);

  const carriers = [];
  for (const carrier of CARRIERS) {
    carriers.push(await upsert(Carrier, { code: carrier.code }, { ...carrier, status: 'active' }));
  }
  console.log(`Carriers: ${carriers.length}`);

  const vendors = [];
  for (const vendor of VENDORS) {
    vendors.push(await upsert(Vendor, { code: vendor.code }, { ...vendor, status: 'active' }));
  }
  console.log(`Vendors: ${vendors.length}`);

  const invoicesByNumber = new Map();
  for (const template of INVOICES) {
    const doc = buildInvoiceDoc(template, customers[template.customer]._id, carriers[template.carrier]._id);
    const invoice = await upsert(Invoice, { invoiceNumber: template.number }, doc);
    invoicesByNumber.set(template.number, invoice);
  }
  console.log(`Invoices: ${invoicesByNumber.size}`);

  for (const template of PAYMENTS) {
    const invoice = invoicesByNumber.get(template.invoice);
    await upsert(
      Payment,
      { paymentNumber: template.number },
      {
        paymentNumber: template.number,
        invoice: invoice._id,
        customer: invoice.customer,
        amount: round2(invoice.totalAmount * template.fraction),
        currency: invoice.currency,
        method: template.method,
        reference: template.reference,
        paidAt: dateInMonth(INVOICES.find((i) => i.number === template.invoice).monthsAgo, 18),
        status: template.status,
        notes: 'Demo data — created by `npm run seed:demo`.',
      }
    );
  }
  console.log(`Customer payments: ${PAYMENTS.length}`);

  for (const template of CARRIER_PAYMENTS) {
    await upsert(
      CarrierPayment,
      { paymentNumber: template.number },
      {
        paymentNumber: template.number,
        carrier: template.carrier !== undefined ? carriers[template.carrier]._id : undefined,
        vendor: template.vendor !== undefined ? vendors[template.vendor]._id : undefined,
        amount: template.amount,
        currency: 'USD',
        method: template.method,
        reference: template.reference,
        billingPeriodStart: dateInMonth(template.monthsAgo, 1),
        billingPeriodEnd: dateInMonth(template.monthsAgo, 28),
        paidAt: dateInMonth(template.monthsAgo, 20),
        status: template.status,
        notes: 'Demo data — created by `npm run seed:demo`.',
      }
    );
  }
  console.log(`Carrier payments: ${CARRIER_PAYMENTS.length}`);

  await disconnectDB();
  console.log('Demo data seeding complete. Open /accounting and /reports to see it.');
  process.exit(0);
}

seedDemoData().catch(async (err) => {
  console.error('Demo data seeding failed:', err);
  process.exit(1);
});
