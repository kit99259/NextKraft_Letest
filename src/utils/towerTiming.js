/**
 * Tower mechanical timing constants (seconds).
 *
 * One-way park / move-with-traverse:
 *   Total = Constant Lift + (3.24 × Distance) + Constant Traverse
 *   Distance = ABS(Current Floor - Target Floor)
 */
const TOWER_CONSTANT_LIFT_TIME_SEC = 51.74;
const TOWER_SECONDS_PER_FLOOR = 3.24;
const TOWER_CONSTANT_TRAVERSE_TIME_SEC = 46.47;

/**
 * Estimated release/retrieve time for Tower systems (seconds).
 *
 * Release motion:
 * 1) Lift from current floor to parked floor + traverse to take car
 * 2) Return pallet to ground without traverse
 *
 * For customer release requests, current floor is treated as ground (0)
 * and target floor is the parked car level.
 *
 * @param {number|null|undefined} targetFloor - Floor where the car is parked
 * @param {number} [currentFloor=0] - Lift start floor (ground = 0)
 * @returns {number} Rounded total seconds
 */
const calculateTowerReleaseEstimatedTime = (targetFloor, currentFloor = 0) => {
  const distance = Math.abs(Number(currentFloor || 0) - Number(targetFloor || 0));

  const timeToCarWithTraverse =
    TOWER_CONSTANT_LIFT_TIME_SEC +
    TOWER_SECONDS_PER_FLOOR * distance +
    TOWER_CONSTANT_TRAVERSE_TIME_SEC;

  const timeBackToGroundWithoutTraverse =
    TOWER_CONSTANT_LIFT_TIME_SEC + TOWER_SECONDS_PER_FLOOR * distance;

  return Math.round(timeToCarWithTraverse + timeBackToGroundWithoutTraverse);
};

module.exports = {
  TOWER_CONSTANT_LIFT_TIME_SEC,
  TOWER_SECONDS_PER_FLOOR,
  TOWER_CONSTANT_TRAVERSE_TIME_SEC,
  calculateTowerReleaseEstimatedTime,
};
