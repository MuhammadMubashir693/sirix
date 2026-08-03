const express = require('express');
const partyController = require('../controllers/partyController');

const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const auditLogger = require('../middleware/auditLogger');
const { authorizePermission } = require('../middleware/authorize');

const {
  listQuery,
  idParam,
  createCustomer,
  updateCustomer,
  createCarrier,
  updateCarrier,
} = require('../validators/partyValidators');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Parties
 *   description: Customers, carriers, and vendors — the counterparties invoices and payments reference
 */

/**
 * Registers CRUD routes for one party type. Customers and carriers/vendors differ
 * only in their body schema (email-keyed vs code-keyed) and permission module.
 */
function registerPartyRoutes({ path, module, controller, createSchema, updateSchema, auditName }) {
  /**
   * @swagger
   * /{path}:
   *   get:
   *     summary: List parties (paginated, searchable by name/email, filterable by status)
   *     tags: [Parties]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: OK
   *   post:
   *     summary: Create a party
   *     tags: [Parties]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       201:
   *         description: Created
   */
  router
    .route(`/${path}`)
    .get(authorizePermission(`${module}:read`), validate(listQuery), controller.list)
    .post(
      authorizePermission(`${module}:create`),
      validate(createSchema),
      auditLogger('ACCOUNTING', `${auditName}_CREATED`),
      controller.create
    );

  /**
   * @swagger
   * /{path}/{id}:
   *   get:
   *     summary: Get a party by id
   *     tags: [Parties]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: OK
   *   put:
   *     summary: Update a party
   *     tags: [Parties]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: OK
   *   delete:
   *     summary: Soft-delete a party
   *     tags: [Parties]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: OK
   */
  router
    .route(`/${path}/:id`)
    .get(authorizePermission(`${module}:read`), validate(idParam), controller.getById)
    .put(
      authorizePermission(`${module}:update`),
      validate(updateSchema),
      auditLogger('ACCOUNTING', `${auditName}_UPDATED`),
      controller.update
    )
    .delete(
      authorizePermission(`${module}:delete`),
      validate(idParam),
      auditLogger('ACCOUNTING', `${auditName}_DELETED`),
      controller.remove
    );
}

registerPartyRoutes({
  path: 'customers',
  module: 'customers',
  controller: partyController.customers,
  createSchema: createCustomer,
  updateSchema: updateCustomer,
  auditName: 'CUSTOMER',
});

registerPartyRoutes({
  path: 'carriers',
  module: 'carriers',
  controller: partyController.carriers,
  createSchema: createCarrier,
  updateSchema: updateCarrier,
  auditName: 'CARRIER',
});

registerPartyRoutes({
  path: 'vendors',
  module: 'vendors',
  controller: partyController.vendors,
  createSchema: createCarrier,
  updateSchema: updateCarrier,
  auditName: 'VENDOR',
});

module.exports = router;
