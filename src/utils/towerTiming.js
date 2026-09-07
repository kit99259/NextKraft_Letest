/**
 * Tower mechanical timing constants (seconds).
 *
 * Release path (with pallet on lift):
 *   CURRENT → PARKED_PALLET (+traverse) → TARGET_CAR (+traverse) → GROUND
 *
 *   D1 = ABS(CurrentFloor - PalletFloor)
 *   D2 = ABS(PalletFloor - TargetFloor)
 *   D3 = ABS(TargetFloor - GroundFloor)   // GroundFloor = 0
 *   TotalFloorDistance = D1 + D2 + D3
 *
 *   TotalTime =
 *     (C1 × C1Count) + (C2 × C2Count) + (SecondsPerFloor × TotalFloorDistance)
 *     + (TraverseTime × TraverseCount)
 *
 * Default with pallet: C1Count=2, C2Count=3, TraverseCount=2
 * No pallet on lift (Transporter 0/1): skip pallet leg; TraverseCount=1, C2Count=2;
 *   C1Count=2 at ground (CurrentFloor=0), else C1Count=1
 */

const TOWER_C1_SEC = 34.73;
const TOWER_C2_SEC = 12.72;
const TOWER_SECONDS_PER_FLOOR = 3.24;
const TOWER_CONSTANT_TRAVERSE_TIME_SEC = 46.47;
const TOWER_GROUND_FLOOR = 0;

/** @deprecated Prefer TOWER_C1_SEC; kept for older imports */
const TOWER_CONSTANT_LIFT_TIME_SEC = TOWER_C1_SEC + TOWER_C2_SEC; // ~47.45 legacy alias

/**
 * Map PLC floor counter / transporter floor raw value to building floor index.
 * PLC: 0=GF, 1=TT, 2=1F, 3=2F, ...
 * Building: 0=GF, 1=TT or 1F, 2=2F, ...
 *   0 → 0; 1 → 1; N≥2 → N-1
 */
const mapPlcFloorToBuildingFloor = (raw) => {
  if (raw == null || raw === '') return 0;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n === 1) return 1;
  return Math.floor(n) - 1;
};

/**
 * Transporter pallet floor 0 or 1 ⇒ no usable pallet on lift (ground / empty).
 */
const isNoPalletOnLift = (palletFloorRawOrMapped) => {
  if (palletFloorRawOrMapped == null || palletFloorRawOrMapped === '') return true;
  const n =
    typeof palletFloorRawOrMapped === 'number'
      ? palletFloorRawOrMapped
      : Number(String(palletFloorRawOrMapped).trim());
  if (!Number.isFinite(n)) return true;
  return n <= 1;
};

/**
 * Resolve C1/C2/Traverse counts for a release cycle.
 * @param {{ currentFloor?: number, hasPalletOnLift?: boolean }} opts
 */
const resolveTowerReleaseCounts = ({ currentFloor = 0, hasPalletOnLift = false } = {}) => {
  if (hasPalletOnLift) {
    // Ground → ParkedPalletFloor → TargetFloor → Ground
    return { c1Count: 2, c2Count: 3, traverseCount: 2 };
  }
  // No pallet: CURRENT → TARGET (+traverse) → GROUND
  const atGround = Number(currentFloor || 0) <= 0;
  return {
    c1Count: atGround ? 2 : 1,
    c2Count: 2,
    traverseCount: 1,
  };
};

/**
 * Core tower release ETA (seconds).
 *
 * @param {object} params
 * @param {number} params.targetFloor - Parked car / pick floor
 * @param {number} [params.currentFloor=0] - Live lift floor (building index)
 * @param {number} [params.palletFloor=0] - Transporter pallet floor (building index); 0/empty = no pallet
 * @param {boolean} [params.hasPalletOnLift] - Override; default inferred from palletFloor > 1 or > 0 after mapping
 * @returns {number} Rounded total seconds
 */
const calculateTowerReleaseEstimatedTime = (targetFloorOrParams, currentFloorMaybe = 0) => {
  // Backward-compatible: (targetFloor, currentFloor=0)
  let targetFloor;
  let currentFloor = 0;
  let palletFloor = 0;
  let hasPalletOnLift;

  if (
    targetFloorOrParams != null &&
    typeof targetFloorOrParams === 'object' &&
    !Array.isArray(targetFloorOrParams)
  ) {
    targetFloor = Number(targetFloorOrParams.targetFloor || 0);
    currentFloor = Number(targetFloorOrParams.currentFloor || 0);
    palletFloor = Number(targetFloorOrParams.palletFloor || 0);
    hasPalletOnLift = targetFloorOrParams.hasPalletOnLift;
  } else {
    targetFloor = Number(targetFloorOrParams || 0);
    currentFloor = Number(currentFloorMaybe || 0);
    palletFloor = 0;
    hasPalletOnLift = false;
  }

  if (hasPalletOnLift == null) {
    // Mapped building floors: pallet on lift when palletFloor >= 1 and we treat
    // explicit palletFloor>0 with hasPallet from caller; for mapped values,
    // no-pallet cases send palletFloor=0.
    hasPalletOnLift = palletFloor > 0;
  }

  const counts = resolveTowerReleaseCounts({ currentFloor, hasPalletOnLift });

  let totalFloorDistance;
  if (hasPalletOnLift) {
    const d1 = Math.abs(currentFloor - palletFloor);
    const d2 = Math.abs(palletFloor - targetFloor);
    const d3 = Math.abs(targetFloor - TOWER_GROUND_FLOOR);
    totalFloorDistance = d1 + d2 + d3;
  } else {
    // CURRENT → TARGET → GROUND (no middle pallet pickup)
    const d2 = Math.abs(currentFloor - targetFloor);
    const d3 = Math.abs(targetFloor - TOWER_GROUND_FLOOR);
    totalFloorDistance = d2 + d3;
  }

  const total =
    TOWER_C1_SEC * counts.c1Count +
    TOWER_C2_SEC * counts.c2Count +
    TOWER_SECONDS_PER_FLOOR * totalFloorDistance +
    TOWER_CONSTANT_TRAVERSE_TIME_SEC * counts.traverseCount;

  return Math.round(total);
};

/**
 * Customer pending-release ETA: ground, no pallet on lift, then queue wait
 * using average target floor of requests ahead × count ahead.
 *
 * @param {number} targetFloor - This request's parked car floor
 * @param {number[]} waitingTargetFloors - Floors of release requests ahead
 * @returns {{ estimatedTime: number, totalEstimatedTime: number, waitingNumber: number }}
 */
const calculateCustomerTowerReleaseQueueEstimate = (targetFloor, waitingTargetFloors = []) => {
  const estimatedTime = calculateTowerReleaseEstimatedTime({
    targetFloor,
    currentFloor: 0,
    palletFloor: 0,
    hasPalletOnLift: false,
  });

  const waitingNumber = Array.isArray(waitingTargetFloors) ? waitingTargetFloors.length : 0;
  if (waitingNumber === 0) {
    return { estimatedTime, totalEstimatedTime: estimatedTime, waitingNumber: 0 };
  }

  const sum = waitingTargetFloors.reduce((acc, f) => acc + Number(f || 0), 0);
  const avgTargetFloor = sum / waitingNumber;
  const avgJobTime = calculateTowerReleaseEstimatedTime({
    targetFloor: avgTargetFloor,
    currentFloor: 0,
    palletFloor: 0,
    hasPalletOnLift: false,
  });

  const totalEstimatedTime = Math.round(estimatedTime + avgJobTime * waitingNumber);
  return { estimatedTime, totalEstimatedTime, waitingNumber };
};

module.exports = {
  TOWER_C1_SEC,
  TOWER_C2_SEC,
  TOWER_SECONDS_PER_FLOOR,
  TOWER_CONSTANT_TRAVERSE_TIME_SEC,
  TOWER_CONSTANT_LIFT_TIME_SEC,
  TOWER_GROUND_FLOOR,
  mapPlcFloorToBuildingFloor,
  isNoPalletOnLift,
  resolveTowerReleaseCounts,
  calculateTowerReleaseEstimatedTime,
  calculateCustomerTowerReleaseQueueEstimate,
};
