-- Run on existing databases after deploying the new ParkingSystem.Status enum.
-- Maps legacy values to Idle, then replaces the ENUM definition.

UPDATE parking_system
SET Status = 'Idle'
WHERE Status IN ('PalletMovingToGround', 'PalletMovingToParking', 'AtGround');

ALTER TABLE parking_system
MODIFY COLUMN Status ENUM(
  'Idle', 'LiftUp', 'LiftDown', 'LeftTaking', 'LeftLeaving',
  'RightTaking', 'RightLeaving', 'TT_0_180', 'TT_180_0',
  'DoorOpen', 'DoorClose'
) DEFAULT 'Idle';
