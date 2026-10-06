-- Foolproof SyncUUID sync: scope error/system logs + upsert by SyncUuid
-- Deploy after Omron SyncUuid schema; before/with operator app update.

-- ERROR LOGS
ALTER TABLE error_logs
  ADD COLUMN SyncUuid VARCHAR(64) NULL AFTER Id,
  ADD COLUMN ProjectId INT NULL AFTER PlcLogId,
  ADD COLUMN ParkingSystemId INT NULL AFTER ProjectId;

UPDATE error_logs
SET SyncUuid = CONCAT('legacy-error_logs-', PlcLogId)
WHERE SyncUuid IS NULL OR SyncUuid = '';

ALTER TABLE error_logs
  MODIFY COLUMN SyncUuid VARCHAR(64) NOT NULL;

ALTER TABLE error_logs
  DROP INDEX uq_error_logs_plclogid;

ALTER TABLE error_logs
  ADD UNIQUE KEY uq_error_logs_syncuuid (SyncUuid),
  ADD KEY idx_error_logs_ps_plclogid (ParkingSystemId, PlcLogId),
  ADD KEY idx_error_logs_projectid (ProjectId),
  ADD KEY idx_error_logs_parkingsystemid (ParkingSystemId);

-- SYSTEM LOGS
ALTER TABLE system_logs
  ADD COLUMN SyncUuid VARCHAR(64) NULL AFTER Id,
  ADD COLUMN ProjectId INT NULL AFTER PlcLogId,
  ADD COLUMN ParkingSystemId INT NULL AFTER ProjectId;

UPDATE system_logs
SET SyncUuid = CONCAT('legacy-system_logs-', PlcLogId)
WHERE SyncUuid IS NULL OR SyncUuid = '';

ALTER TABLE system_logs
  MODIFY COLUMN SyncUuid VARCHAR(64) NOT NULL;

ALTER TABLE system_logs
  DROP INDEX uq_system_logs_plclogid;

ALTER TABLE system_logs
  ADD UNIQUE KEY uq_system_logs_syncuuid (SyncUuid),
  ADD KEY idx_system_logs_ps_plclogid (ParkingSystemId, PlcLogId),
  ADD KEY idx_system_logs_projectid (ProjectId),
  ADD KEY idx_system_logs_parkingsystemid (ParkingSystemId);
