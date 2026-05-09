/**
 * ParkingSystem.Status enum values (DB column + API).
 * Labels (UI): IDLE, LIFT UP, LIFT DOWN, LEFT TAKING, LEFT LEAVING,
 * RIGHT TAKING, RIGHT LEAVING, TT (0–180), TT (180–0), DOOR OPEN, DOOR CLOSE.
 */
const PARKING_SYSTEM_STATUS_VALUES = Object.freeze([
  'Idle',
  'LiftUp',
  'LiftDown',
  'LeftTaking',
  'LeftLeaving',
  'RightTaking',
  'RightLeaving',
  'TT_0_180',
  'TT_180_0',
  'DoorOpen',
  'DoorClose'
]);

module.exports = {
  PARKING_SYSTEM_STATUS_VALUES
};
