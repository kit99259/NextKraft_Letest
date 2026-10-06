const { Op } = require('sequelize');

const toRow = (row) => {
  if (!row) return null;
  const plain = row.get ? row.get({ plain: true }) : row;
  const mapped = {
    id: plain.Id,
    syncUuid: plain.SyncUuid ?? null,
    plclogId: plain.PlcLogId,
    projectId: plain.ProjectId ?? null,
    parkingSystemId: plain.ParkingSystemId ?? null,
    type: plain.Type ?? '',
    key: plain.LogKey,
    value: plain.LogValue != null ? String(plain.LogValue) : '',
    createdAt: plain.CreatedAt,
    updatedAt: plain.UpdatedAt
  };
  if (Object.prototype.hasOwnProperty.call(plain, 'Message')) {
    mapped.message = plain.Message != null ? String(plain.Message) : '';
  }
  return mapped;
};

const normalizePlcLogId = (item) => {
  if (item.plclogId != null) return parseInt(item.plclogId, 10);
  if (item.id != null) return parseInt(item.id, 10);
  return NaN;
};

const normalizeSyncUuid = (item) => {
  const raw = item.syncUuid ?? item.SyncUuid;
  if (raw == null) return '';
  return String(raw).trim();
};

const normalizeScopeId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
};

const mapBulkCreateRow = (item) => {
  const plcLogId = normalizePlcLogId(item);
  const syncUuid = normalizeSyncUuid(item);
  const projectId = normalizeScopeId(item.projectId ?? item.ProjectId);
  const parkingSystemId = normalizeScopeId(item.parkingSystemId ?? item.ParkingSystemId);
  const row = {
    SyncUuid: syncUuid,
    PlcLogId: plcLogId,
    ProjectId: projectId,
    ParkingSystemId: parkingSystemId,
    Type: item.type != null ? String(item.type) : '',
    LogKey: String(item.key),
    LogValue: String(item.value != null ? item.value : '')
  };
  if (item.message !== undefined) {
    row.Message = String(item.message != null ? item.message : '');
  }
  if (item.createdAt) row.CreatedAt = new Date(item.createdAt);
  if (item.updatedAt) row.UpdatedAt = new Date(item.updatedAt);
  return row;
};

const bulkAddLogs = async (Model, items) => {
  if (!items?.length) {
    throw new Error('logs array is required and must not be empty');
  }
  const rows = items.map(mapBulkCreateRow);
  for (const r of rows) {
    if (!r.SyncUuid) {
      throw new Error('Each log must have a non-empty syncUuid');
    }
    if (!Number.isFinite(r.PlcLogId) || r.PlcLogId < 1) {
      throw new Error('Each log must have a valid plclog id (use id or plclogId)');
    }
    if (!r.LogKey) {
      throw new Error('Each log must have a non-empty key');
    }
    if (r.ProjectId == null) {
      throw new Error('Each log must have a valid projectId');
    }
    if (r.ParkingSystemId == null) {
      throw new Error('Each log must have a valid parkingSystemId');
    }
  }

  const updateOnDuplicate = [
    'PlcLogId',
    'ProjectId',
    'ParkingSystemId',
    'Type',
    'LogKey',
    'LogValue',
    'UpdatedAt'
  ];
  if (Model.rawAttributes?.Message) {
    updateOnDuplicate.push('Message');
    rows.forEach((r) => {
      if (r.Message === undefined) r.Message = '';
    });
  }

  await Model.bulkCreate(rows, {
    updateOnDuplicate
  });

  const syncUuids = rows.map((r) => r.SyncUuid);
  const created = await Model.findAll({
    where: { SyncUuid: { [Op.in]: syncUuids } },
    order: [['Id', 'ASC']]
  });
  return created.map(toRow);
};

const bulkUpdateLogs = async (Model, items) => {
  if (!items?.length) {
    throw new Error('logs array is required and must not be empty');
  }
  const sequelize = Model.sequelize;
  const t = await sequelize.transaction();
  try {
    const updated = [];
    for (const item of items) {
      const rowId = item.id != null ? parseInt(item.id, 10) : NaN;
      if (!Number.isFinite(rowId) || rowId < 1) {
        throw new Error('Each log update must include a valid table id');
      }
      const existing = await Model.findByPk(rowId, { transaction: t });
      if (!existing) {
        throw new Error(`Log row not found for id ${rowId}`);
      }
      if (item.syncUuid !== undefined) {
        const syncUuid = normalizeSyncUuid(item);
        if (!syncUuid) {
          throw new Error('Invalid syncUuid');
        }
        const clash = await Model.findOne({
          where: { SyncUuid: syncUuid, Id: { [Op.ne]: rowId } },
          transaction: t
        });
        if (clash) {
          throw new Error(`SyncUuid ${syncUuid} is already used by another row`);
        }
        existing.SyncUuid = syncUuid;
      }
      if (item.type !== undefined) existing.Type = item.type != null ? String(item.type) : '';
      if (item.key !== undefined) existing.LogKey = String(item.key);
      if (item.value !== undefined) existing.LogValue = String(item.value != null ? item.value : '');
      if (item.message !== undefined && Object.prototype.hasOwnProperty.call(existing.dataValues, 'Message')) {
        existing.Message = String(item.message != null ? item.message : '');
      }
      if (item.projectId !== undefined) {
        const pid = normalizeScopeId(item.projectId);
        if (pid == null) throw new Error('Invalid projectId');
        existing.ProjectId = pid;
      }
      if (item.parkingSystemId !== undefined) {
        const psid = normalizeScopeId(item.parkingSystemId);
        if (psid == null) throw new Error('Invalid parkingSystemId');
        existing.ParkingSystemId = psid;
      }
      if (item.plclogId !== undefined) {
        const pid = parseInt(item.plclogId, 10);
        if (!Number.isFinite(pid) || pid < 1) {
          throw new Error('Invalid plclogId');
        }
        existing.PlcLogId = pid;
      }
      if (item.createdAt !== undefined && item.createdAt != null) {
        existing.CreatedAt = new Date(item.createdAt);
      }
      if (item.updatedAt !== undefined && item.updatedAt != null) {
        existing.UpdatedAt = new Date(item.updatedAt);
      }
      await existing.save({ transaction: t });
      updated.push(toRow(existing));
    }
    await t.commit();
    return updated;
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

const getLogs = async (Model, query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 500);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  const where = {};

  const projectId = normalizeScopeId(query.projectId);
  if (projectId != null) where.ProjectId = projectId;

  const parkingSystemId = normalizeScopeId(query.parkingSystemId);
  if (parkingSystemId != null) where.ParkingSystemId = parkingSystemId;

  if (query.syncUuid != null && String(query.syncUuid).trim() !== '') {
    where.SyncUuid = String(query.syncUuid).trim();
  }

  if (query.plclogId != null && query.plclogId !== '') {
    const pid = parseInt(query.plclogId, 10);
    if (Number.isFinite(pid)) where.PlcLogId = pid;
  } else {
    const range = {};
    if (query.plclogIdFrom != null && query.plclogIdFrom !== '') {
      const from = parseInt(query.plclogIdFrom, 10);
      if (Number.isFinite(from)) range[Op.gte] = from;
    }
    if (query.plclogIdTo != null && query.plclogIdTo !== '') {
      const to = parseInt(query.plclogIdTo, 10);
      if (Number.isFinite(to)) range[Op.lte] = to;
    }
    if (Object.keys(range).length) {
      where.PlcLogId = range;
    }
  }
  if (query.type != null && query.type !== '') {
    where.Type = String(query.type);
  }
  if (query.key != null && query.key !== '') {
    where.LogKey = String(query.key);
  }
  if (query.message != null && query.message !== '' && Model.rawAttributes?.Message) {
    where.Message = String(query.message);
  }

  const { rows, count } = await Model.findAndCountAll({
    where,
    limit,
    offset,
    order: [['Id', 'DESC']]
  });

  return {
    logs: rows.map(toRow),
    total: count,
    limit,
    offset
  };
};

const getLastPlcLogId = async (Model, query = {}) => {
  const where = {};
  const projectId = normalizeScopeId(query.projectId);
  if (projectId != null) where.ProjectId = projectId;
  const parkingSystemId = normalizeScopeId(query.parkingSystemId);
  if (parkingSystemId != null) where.ParkingSystemId = parkingSystemId;

  const row = await Model.findOne({
    attributes: [[Model.sequelize.fn('MAX', Model.sequelize.col('PlcLogId')), 'maxPlc']],
    where: Object.keys(where).length ? where : undefined,
    raw: true
  });
  const max = row ? (row.maxPlc ?? row.maxplc) : null;
  const lastPlcLogId = max != null ? parseInt(max, 10) : null;
  return {
    lastPlcLogId: Number.isFinite(lastPlcLogId) ? lastPlcLogId : null,
    projectId: projectId ?? null,
    parkingSystemId: parkingSystemId ?? null
  };
};

module.exports = {
  bulkAddLogs,
  bulkUpdateLogs,
  getLogs,
  getLastPlcLogId,
  toRow
};
