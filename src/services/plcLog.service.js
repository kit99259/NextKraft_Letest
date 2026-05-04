const { Op } = require('sequelize');

const toRow = (row) => {
  if (!row) return null;
  const plain = row.get ? row.get({ plain: true }) : row;
  return {
    id: plain.Id,
    plclogId: plain.PlcLogId,
    type: plain.Type ?? '',
    key: plain.LogKey,
    value: plain.LogValue != null ? String(plain.LogValue) : '',
    createdAt: plain.CreatedAt,
    updatedAt: plain.UpdatedAt
  };
};

const normalizePlcLogId = (item) => {
  if (item.plclogId != null) return parseInt(item.plclogId, 10);
  if (item.id != null) return parseInt(item.id, 10);
  return NaN;
};

const mapBulkCreateRow = (item) => {
  const plcLogId = normalizePlcLogId(item);
  const row = {
    PlcLogId: plcLogId,
    Type: item.type != null ? String(item.type) : '',
    LogKey: String(item.key),
    LogValue: String(item.value != null ? item.value : '')
  };
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
    if (!Number.isFinite(r.PlcLogId) || r.PlcLogId < 1) {
      throw new Error('Each log must have a valid plclog id (use id or plclogId)');
    }
    if (!r.LogKey) {
      throw new Error('Each log must have a non-empty key');
    }
  }

  await Model.bulkCreate(rows, {
    updateOnDuplicate: ['Type', 'LogKey', 'LogValue', 'UpdatedAt']
  });

  const plcIds = rows.map((r) => r.PlcLogId);
  const created = await Model.findAll({
    where: { PlcLogId: { [Op.in]: plcIds } },
    order: [['PlcLogId', 'ASC']]
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
      if (item.type !== undefined) existing.Type = item.type != null ? String(item.type) : '';
      if (item.key !== undefined) existing.LogKey = String(item.key);
      if (item.value !== undefined) existing.LogValue = String(item.value != null ? item.value : '');
      if (item.plclogId !== undefined) {
        const pid = parseInt(item.plclogId, 10);
        if (!Number.isFinite(pid) || pid < 1) {
          throw new Error('Invalid plclogId');
        }
        const clash = await Model.findOne({
          where: { PlcLogId: pid, Id: { [Op.ne]: rowId } },
          transaction: t
        });
        if (clash) {
          throw new Error(`PlcLogId ${pid} is already used by another row`);
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

const getLastPlcLogId = async (Model) => {
  const row = await Model.findOne({
    attributes: [[Model.sequelize.fn('MAX', Model.sequelize.col('PlcLogId')), 'maxPlc']],
    raw: true
  });
  const max = row ? (row.maxPlc ?? row.maxplc) : null;
  const lastPlcLogId = max != null ? parseInt(max, 10) : null;
  return {
    lastPlcLogId: Number.isFinite(lastPlcLogId) ? lastPlcLogId : null
  };
};

module.exports = {
  bulkAddLogs,
  bulkUpdateLogs,
  getLogs,
  getLastPlcLogId,
  toRow
};
