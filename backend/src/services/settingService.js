const settingRepository = require('../repositories/settingRepository');
const ApiError = require('../utils/ApiError');

async function listSettings({ group } = {}) {
  return settingRepository.findAll({ group });
}

async function getSetting(key) {
  const setting = await settingRepository.findByKey(key);
  if (!setting) throw ApiError.notFound('Setting not found');
  return setting;
}

async function upsertSetting(key, { value, type, group, description, isPublic }, updatedBy) {
  return settingRepository.upsert(key, { value, type, group, description, isPublic }, updatedBy);
}

async function bulkUpsertSettings(settings, updatedBy) {
  return Promise.all(settings.map((s) => settingRepository.upsert(s.key, s, updatedBy)));
}

async function deleteSetting(key, deletedBy) {
  const setting = await settingRepository.findByKey(key);
  if (!setting) throw ApiError.notFound('Setting not found');
  await setting.softDelete(deletedBy);
}

module.exports = { listSettings, getSetting, upsertSetting, bulkUpsertSettings, deleteSetting };
