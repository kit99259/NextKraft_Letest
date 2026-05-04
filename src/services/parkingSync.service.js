const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize } = require('../config/database');
const {
  Operator,
  ParkingSystem,
  PalletAllotment,
  Car,
  User,
  Customer,
  ParkingRequest,
  Request,
  RequestQueue
} = require('../models/associations');
const { CAR_TYPE_VALUES } = require('../utils/constant');

const getISTTime = () => {
  const now = new Date();
  const utcTime = now.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(utcTime + istOffset);
};

const asDate = (value, fallback = null) => {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
};

const normalizeCarNumber = (value) => String(value ?? '').trim();
const normalizeCarType = (value) => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return null;
  if (raw === 'sedan') return 'Sedan';
  if (raw === 'suv') return 'SUV';
  return null;
};

const toResponsePallet = (pallet) => ({
  palletId: pallet.Id,
  parkingSystemId: pallet.ParkingSystemId,
  projectId: pallet.ProjectId,
  level: pallet.Level,
  levelBelowGround: pallet.LevelBelowGround,
  column: pallet.Column,
  status: pallet.Status,
  userId: pallet.UserId,
  carId: pallet.CarId
});

const resolvePalletWhere = (operator, parkingSystemType, floorMapping) => {
  const floor = parseInt(floorMapping.floor, 10);
  const column = parseInt(floorMapping.floorColumn, 10);

  if (!Number.isFinite(column) || column < 1) {
    throw new Error('Invalid floorColumn in floorMapping');
  }
  if (!Number.isFinite(floor) || floor === 0) {
    throw new Error('Invalid floor in floorMapping');
  }

  const where = {
    ParkingSystemId: operator.ParkingSystemId,
    ProjectId: operator.ProjectId,
    Column: column
  };

  if (parkingSystemType === 'Tower') {
    if (floor < 1) {
      throw new Error('Tower floor must be positive');
    }
    where.Level = floor;
    where.LevelBelowGround = null;
    return where;
  }

  if (floor > 0) {
    where.Level = floor;
    where.LevelBelowGround = null;
  } else {
    where.Level = null;
    where.LevelBelowGround = Math.abs(floor);
  }
  return where;
};

const findOrCreateDummyCustomer = async (operator, operatorUserId, transaction) => {
  let existingDummyCustomer = await Customer.findOne({
    where: {
      ParkingSystemId: operator.ParkingSystemId,
      ProjectId: operator.ProjectId
    },
    include: [
      {
        model: User,
        as: 'user',
        where: {
          Username: { [Op.like]: 'dummynextcraft%' }
        },
        attributes: ['Id', 'Username', 'Role']
      }
    ],
    transaction
  });

  if (existingDummyCustomer && existingDummyCustomer.user) {
    return {
      user: existingDummyCustomer.user,
      customer: existingDummyCustomer
    };
  }

  const uuid = crypto.randomUUID();
  const dummyUsername = `dummynextcraft${uuid}`;
  const hashedPassword = await bcrypt.hash('dummy123', 10);

  const user = await User.create(
    {
      Username: dummyUsername,
      Password: hashedPassword,
      Role: 'customer'
    },
    { transaction }
  );

  const istTime = getISTTime();
  const customer = await Customer.create(
    {
      UserId: user.Id,
      FirstName: 'Dummy',
      LastName: 'Customer',
      Email: null,
      MobileNumber: null,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId,
      FlatNumber: null,
      Profession: null,
      Status: 'Approved',
      ApprovedBy: operatorUserId,
      ApprovedAt: istTime,
      CreatedAt: istTime,
      UpdatedAt: istTime
    },
    { transaction }
  );

  return { user, customer };
};

const resolveOrCreateCarAndCustomer = async (
  operator,
  operatorUserId,
  carNumber,
  floorMappingCarType,
  transaction
) => {
  const normalizedCarNumber = normalizeCarNumber(carNumber);
  if (!normalizedCarNumber) {
    throw new Error('carNumber is required');
  }

  let car = await Car.findOne({
    where: { CarNumber: normalizedCarNumber },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ],
    transaction
  });

  if (car) {
    const customer = await Customer.findOne({
      where: {
        UserId: car.UserId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: operator.ParkingSystemId
      },
      transaction
    });

    if (!customer) {
      throw new Error('Customer not found for this car');
    }
    if (customer.Status !== 'Approved') {
      throw new Error('Customer is not approved. Only approved customers can be assigned to pallets');
    }

    return { car, customer };
  }

  const { user, customer } = await findOrCreateDummyCustomer(operator, operatorUserId, transaction);
  const normalizedCarType = normalizeCarType(floorMappingCarType);
  const carType = CAR_TYPE_VALUES.includes(normalizedCarType) ? normalizedCarType : null;
  const istTime = getISTTime();

  car = await Car.create(
    {
      UserId: user.Id,
      CarType: carType,
      CarModel: null,
      CarCompany: null,
      CarNumber: normalizedCarNumber,
      CreatedAt: istTime,
      UpdatedAt: istTime
    },
    { transaction }
  );

  return { car, customer };
};

const ensureParkingRequestCompleted = async (
  operator,
  car,
  parkingTime,
  updatedAt,
  transaction
) => {
  const reqTime = asDate(parkingTime, getISTTime());
  const updTime = asDate(updatedAt, reqTime);

  let parkingRequest = await ParkingRequest.findOne({
    where: {
      UserId: car.UserId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId,
      CarId: car.Id
    },
    order: [['UpdatedAt', 'DESC']],
    transaction
  });

  if (!parkingRequest) {
    parkingRequest = await ParkingRequest.create(
      {
        UserId: car.UserId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: operator.ParkingSystemId,
        CarId: car.Id,
        Status: 'Completed',
        CreatedAt: reqTime,
        UpdatedAt: updTime
      },
      { transaction }
    );
  } else {
    await parkingRequest.update(
      {
        Status: 'Completed',
        UpdatedAt: updTime
      },
      { transaction }
    );
  }

  return parkingRequest;
};

const processParkingSync = async (operatorUserId, carAllotHistory = []) => {
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'Type']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }
  if (!operator.ProjectId || !operator.ParkingSystemId || !operator.parkingSystem) {
    throw new Error('Operator is not assigned to a project and parking system');
  }

  const seenRowKeys = new Set();
  const sorted = [...carAllotHistory].sort((a, b) => {
    const aTime = asDate(a.parkingTime || a.updatedAt, new Date(0)).getTime();
    const bTime = asDate(b.parkingTime || b.updatedAt, new Date(0)).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return 0;
  });

  const applied = [];
  const skipped = [];
  const failed = [];

  for (const row of sorted) {
    const historyId = row.id != null ? row.id : null;
    const rowFloorMapping = row.floorMapping || {};
    const rowKey =
      historyId != null && historyId !== ''
        ? `id:${historyId}`
        : `c:${rowFloorMapping.id}|${row.parkingTime}|${normalizeCarNumber(row.carNumber)}|${row.retriveTime || ''}`;
    if (seenRowKeys.has(rowKey)) {
      skipped.push({ historyId, reason: 'Duplicate row in same payload' });
      continue;
    }
    seenRowKeys.add(rowKey);

    const t = await sequelize.transaction();
    try {
      const floorMapping = row.floorMapping;
      if (!floorMapping || typeof floorMapping !== 'object') {
        throw new Error('floorMapping is required for each history row');
      }
      if (parseInt(floorMapping.parkingSystemId, 10) !== operator.ParkingSystemId) {
        throw new Error('floorMapping does not belong to operator parking system');
      }

      const palletWhere = resolvePalletWhere(operator, operator.parkingSystem.Type, floorMapping);
      const pallet = await PalletAllotment.findOne({
        where: palletWhere,
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!pallet) {
        throw new Error('Matching pallet not found for floor mapping');
      }

      const { car, customer } = await resolveOrCreateCarAndCustomer(
        operator,
        operatorUserId,
        row.carNumber,
        floorMapping.carType,
        t
      );

      const parkingAt = asDate(row.parkingTime, getISTTime());
      const rowUpdatedAt = asDate(row.updatedAt, parkingAt);
      const retrieveAt = asDate(row.retriveTime, null);
      const isParkingSynced = row.isParkingSync === true;
      const isRetrivalSynced = row.isRetrivalSync === true;

      if (!isParkingSynced && !isRetrivalSynced) {
        await t.commit();
        skipped.push({ historyId, reason: 'Both parking and retrival sync flags are false' });
        continue;
      }

      if (!retrieveAt) {
        if (isParkingSynced) {
          await t.commit();
          skipped.push({ historyId, reason: 'Parking already synced and retriveTime is null' });
          continue;
        }
        const existingCompleted = await ParkingRequest.findOne({
          where: {
            UserId: car.UserId,
            ProjectId: operator.ProjectId,
            ParkingSystemId: operator.ParkingSystemId,
            CarId: car.Id,
            Status: 'Completed'
          },
          transaction: t
        });

        const alreadyApplied =
          pallet.Status === 'Assigned' &&
          pallet.UserId === customer.UserId &&
          pallet.CarId === car.Id &&
          !!existingCompleted;

        if (alreadyApplied) {
          await t.commit();
          skipped.push({ historyId, reason: 'Already synced state for active parking record' });
          continue;
        }

        await ensureParkingRequestCompleted(operator, car, parkingAt, rowUpdatedAt, t);
        await pallet.update(
          {
            UserId: customer.UserId,
            CarId: car.Id,
            CarType: car.CarType || (CAR_TYPE_VALUES.includes(floorMapping.carType) ? floorMapping.carType : null),
            Status: 'Assigned',
            UpdatedAt: rowUpdatedAt
          },
          { transaction: t }
        );

        await t.commit();
        applied.push({
          historyId,
          action: 'parked',
          pallet: toResponsePallet(pallet),
          carId: car.Id,
          userId: customer.UserId
        });
        continue;
      }

      if (isRetrivalSynced) {
        await t.commit();
        skipped.push({ historyId, reason: 'Retrival already synced' });
        continue;
      }

      let targetPallet = pallet;

      // Recovery path: parking was already synced, retrieval not synced, and car may still
      // be parked on server in another pallet row for this parking system.
      if (isParkingSynced && retrieveAt) {
        const parkedPallet = await PalletAllotment.findOne({
          where: {
            ParkingSystemId: operator.ParkingSystemId,
            ProjectId: operator.ProjectId,
            CarId: car.Id,
            Status: 'Assigned'
          },
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        if (parkedPallet) {
          targetPallet = parkedPallet;
        }
      } else {
        // Ensure parking state exists before retrieve completion.
        await ensureParkingRequestCompleted(operator, car, parkingAt, rowUpdatedAt, t);
      }

      const dedupeQueue = await RequestQueue.findOne({
        where: {
          UserId: customer.UserId,
          PalletAllotmentId: targetPallet.Id,
          CarId: car.Id,
          Status: 'Completed',
          UpdatedAt: { [Op.gte]: new Date(retrieveAt.getTime() - 1000) }
        },
        transaction: t
      });

      if (targetPallet.Status === 'Released' && targetPallet.CarId === null && dedupeQueue) {
        await t.commit();
        skipped.push({ historyId, reason: 'Already synced state for retrieved record' });
        continue;
      }

      const openRequest = await Request.findOne({
        where: {
          PalletAllotmentId: targetPallet.Id,
          ProjectId: operator.ProjectId,
          ParkingSystemId: operator.ParkingSystemId,
          Status: { [Op.notIn]: ['Completed', 'Cancelled'] }
        },
        order: [['UpdatedAt', 'DESC']],
        transaction: t
      });

      if (openRequest) {
        await openRequest.update(
          {
            Status: 'Completed',
            UpdatedAt: retrieveAt
          },
          { transaction: t }
        );

        await RequestQueue.create(
          {
            UserId: openRequest.UserId,
            PalletAllotmentId: openRequest.PalletAllotmentId,
            ProjectId: openRequest.ProjectId,
            ParkingSystemId: openRequest.ParkingSystemId,
            CarId: openRequest.CarId,
            OperatorId: operator.Id,
            Status: 'Completed',
            EstimatedTime: openRequest.EstimatedTime || 0,
            CreatedAt: openRequest.CreatedAt || parkingAt,
            UpdatedAt: retrieveAt
          },
          { transaction: t }
        );

        await openRequest.destroy({ transaction: t });
      } else {
        await RequestQueue.create(
          {
            UserId: customer.UserId,
            PalletAllotmentId: targetPallet.Id,
            ProjectId: operator.ProjectId,
            ParkingSystemId: operator.ParkingSystemId,
            CarId: car.Id,
            OperatorId: operator.Id,
            Status: 'Completed',
            EstimatedTime: 0,
            CreatedAt: parkingAt,
            UpdatedAt: retrieveAt
          },
          { transaction: t }
        );
      }

      await targetPallet.update(
        {
          UserId: 0,
          CarId: null,
          CarType: null,
          Status: 'Released',
          UpdatedAt: retrieveAt
        },
        { transaction: t }
      );

      await t.commit();
      applied.push({
        historyId,
        action: 'retrieved',
        pallet: toResponsePallet(targetPallet),
        carId: car.Id,
        userId: customer.UserId
      });
    } catch (error) {
      await t.rollback();
      failed.push({
        historyId,
        reason: error.message || 'Failed to process sync row'
      });
    }
  }

  return {
    applied,
    skipped,
    failed,
    totals: {
      received: carAllotHistory.length,
      applied: applied.length,
      skipped: skipped.length,
      failed: failed.length
    }
  };
};

module.exports = {
  processParkingSync
};
