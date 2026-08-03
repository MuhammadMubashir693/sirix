const express = require('express');
const accountingController = require('../controllers/accountingController');

const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const auditLogger = require('../middleware/auditLogger');
const { authorizePermission } = require('../middleware/authorize');

const {
  invoiceIdParam,
  listInvoicesQuery,
  createInvoice,
  updateInvoice,
  paymentIdParam,
  listPaymentsQuery,
  createPayment,
  updatePayment,
  carrierPaymentIdParam,
  listCarrierPaymentsQuery,
  createCarrierPayment,
  updateCarrierPayment,
  dashboardQuery,
} = require('../validators/accountingValidators');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Accounting
 *   description: Invoices, customer payments, carrier payments, and the accounting dashboard
 */

// ---------------------------------------------------------------------------
// Accounting dashboard
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /accounting/dashboard:

 *   get:
 *     summary: Get accounting dashboard summary (revenue, expenses, profit, outstanding balances)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/accounting/dashboard',
  authorizePermission('accounting:read'),
  validate(dashboardQuery),
  accountingController.getDashboard
);

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: List invoices (paginated, searchable, filterable)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create an invoice
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router
  .route('/invoices')
  .get(authorizePermission('invoices:read'), validate(listInvoicesQuery), accountingController.listInvoices)
  .post(
    authorizePermission('invoices:create'),
    validate(createInvoice),
    auditLogger('ACCOUNTING', 'INVOICE_CREATED'),
    accountingController.createInvoice
  );

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get an invoice by id
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   put:
 *     summary: Update an invoice
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     summary: Soft-delete an invoice
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router
  .route('/invoices/:id')
  .get(authorizePermission('invoices:read'), validate(invoiceIdParam), accountingController.getInvoice)
  .put(
    authorizePermission('invoices:update'),
    validate(updateInvoice),
    auditLogger('ACCOUNTING', 'INVOICE_UPDATED'),
    accountingController.updateInvoice
  )
  .delete(
    authorizePermission('invoices:delete'),
    validate(invoiceIdParam),
    auditLogger('ACCOUNTING', 'INVOICE_DELETED'),
    accountingController.deleteInvoice
  );

// ---------------------------------------------------------------------------
// Payments (customer payments against invoices)
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: List payments (paginated, searchable, filterable)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Record a payment against an invoice
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router
  .route('/payments')
  .get(authorizePermission('payments:read'), validate(listPaymentsQuery), accountingController.listPayments)
  .post(
    authorizePermission('payments:create'),
    validate(createPayment),
    auditLogger('ACCOUNTING', 'PAYMENT_CREATED'),
    accountingController.createPayment
  );

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a payment by id
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   put:
 *     summary: Update a payment
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     summary: Soft-delete a payment
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router
  .route('/payments/:id')
  .get(authorizePermission('payments:read'), validate(paymentIdParam), accountingController.getPayment)
  .put(
    authorizePermission('payments:update'),
    validate(updatePayment),
    auditLogger('ACCOUNTING', 'PAYMENT_UPDATED'),
    accountingController.updatePayment
  )
  .delete(
    authorizePermission('payments:delete'),
    validate(paymentIdParam),
    auditLogger('ACCOUNTING', 'PAYMENT_DELETED'),
    accountingController.deletePayment
  );

// ---------------------------------------------------------------------------
// Carrier payments (outbound payments to vendors/carriers)
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /carrier-payments:
 *   get:
 *     summary: List carrier payments (paginated, searchable, filterable)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create a carrier payment
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router
  .route('/carrier-payments')
  .get(
    authorizePermission('carrier-payments:read'),
    validate(listCarrierPaymentsQuery),
    accountingController.listCarrierPayments
  )
  .post(
    authorizePermission('carrier-payments:create'),
    validate(createCarrierPayment),
    auditLogger('ACCOUNTING', 'CARRIER_PAYMENT_CREATED'),
    accountingController.createCarrierPayment
  );

/**
 * @swagger
 * /carrier-payments/{id}:
 *   get:
 *     summary: Get a carrier payment by id
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   put:
 *     summary: Update a carrier payment
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     summary: Soft-delete a carrier payment
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router
  .route('/carrier-payments/:id')
  .get(
    authorizePermission('carrier-payments:read'),
    validate(carrierPaymentIdParam),
    accountingController.getCarrierPayment
  )
  .put(
    authorizePermission('carrier-payments:update'),
    validate(updateCarrierPayment),
    auditLogger('ACCOUNTING', 'CARRIER_PAYMENT_UPDATED'),
    accountingController.updateCarrierPayment
  )
  .delete(
    authorizePermission('carrier-payments:delete'),
    validate(carrierPaymentIdParam),
    auditLogger('ACCOUNTING', 'CARRIER_PAYMENT_DELETED'),
    accountingController.deleteCarrierPayment
  );

module.exports = router;
