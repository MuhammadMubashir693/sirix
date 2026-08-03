/**
 * Central import point for all Mongoose models.
 * Required once at app startup so every model is registered before any
 * populate() call needs it — populating by ref name fails silently otherwise
 * if that model's file was never required.
 */
require('./User');
require('./Role');
require('./Permission');
require('./RefreshToken');
require('./AuditLog');
require('./Setting');
require('./Customer');
require('./Carrier');
require('./Vendor');
require('./Invoice');
require('./Payment');
require('./CarrierPayment');

module.exports = {
  User: require('./User'),
  Role: require('./Role'),
  Permission: require('./Permission'),
  RefreshToken: require('./RefreshToken'),
  AuditLog: require('./AuditLog'),
  Setting: require('./Setting'),
  Customer: require('./Customer'),
  Carrier: require('./Carrier'),
  Vendor: require('./Vendor'),
  Invoice: require('./Invoice'),
  Payment: require('./Payment'),
  CarrierPayment: require('./CarrierPayment'),
};
