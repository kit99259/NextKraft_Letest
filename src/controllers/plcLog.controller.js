const ErrorLog = require('../models/ErrorLog');
const SystemLog = require('../models/SystemLog');
const plcLogService = require('../services/plcLog.service');
const { successResponse, errorResponse } = require('../utils');

const statusFromMessage = (msg) => {
  if (!msg) return 500;
  if (msg.includes('not found') || msg.includes('Log row not found')) return 404;
  if (
    msg.includes('required') ||
    msg.includes('must have') ||
    msg.includes('Invalid') ||
    msg.includes('already used')
  ) {
    return 400;
  }
  return 500;
};

const bulkAddErrorLogs = async (req, res) => {
  try {
    const rows = await plcLogService.bulkAddLogs(ErrorLog, req.body.logs);
    return successResponse(res, { logs: rows, count: rows.length }, 'Error logs created successfully', 201);
  } catch (error) {
    console.error('bulkAddErrorLogs:', error);
    return errorResponse(res, error.message || 'Failed to add error logs', statusFromMessage(error.message));
  }
};

const bulkUpdateErrorLogs = async (req, res) => {
  try {
    const rows = await plcLogService.bulkUpdateLogs(ErrorLog, req.body.logs);
    return successResponse(res, { logs: rows, count: rows.length }, 'Error logs updated successfully');
  } catch (error) {
    console.error('bulkUpdateErrorLogs:', error);
    return errorResponse(res, error.message || 'Failed to update error logs', statusFromMessage(error.message));
  }
};

const getErrorLogs = async (req, res) => {
  try {
    const data = await plcLogService.getLogs(ErrorLog, req.query);
    return successResponse(res, data, 'Error logs retrieved successfully');
  } catch (error) {
    console.error('getErrorLogs:', error);
    return errorResponse(res, error.message || 'Failed to retrieve error logs', 500);
  }
};

const getLastErrorLogPlcLogId = async (req, res) => {
  try {
    const data = await plcLogService.getLastPlcLogId(ErrorLog);
    return successResponse(res, data, 'Last error log PLC id retrieved successfully');
  } catch (error) {
    console.error('getLastErrorLogPlcLogId:', error);
    return errorResponse(res, error.message || 'Failed to retrieve last PLC log id', 500);
  }
};

const bulkAddSystemLogs = async (req, res) => {
  try {
    const rows = await plcLogService.bulkAddLogs(SystemLog, req.body.logs);
    return successResponse(res, { logs: rows, count: rows.length }, 'System logs created successfully', 201);
  } catch (error) {
    console.error('bulkAddSystemLogs:', error);
    return errorResponse(res, error.message || 'Failed to add system logs', statusFromMessage(error.message));
  }
};

const bulkUpdateSystemLogs = async (req, res) => {
  try {
    const rows = await plcLogService.bulkUpdateLogs(SystemLog, req.body.logs);
    return successResponse(res, { logs: rows, count: rows.length }, 'System logs updated successfully');
  } catch (error) {
    console.error('bulkUpdateSystemLogs:', error);
    return errorResponse(res, error.message || 'Failed to update system logs', statusFromMessage(error.message));
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const data = await plcLogService.getLogs(SystemLog, req.query);
    return successResponse(res, data, 'System logs retrieved successfully');
  } catch (error) {
    console.error('getSystemLogs:', error);
    return errorResponse(res, error.message || 'Failed to retrieve system logs', 500);
  }
};

const getLastSystemLogPlcLogId = async (req, res) => {
  try {
    const data = await plcLogService.getLastPlcLogId(SystemLog);
    return successResponse(res, data, 'Last system log PLC id retrieved successfully');
  } catch (error) {
    console.error('getLastSystemLogPlcLogId:', error);
    return errorResponse(res, error.message || 'Failed to retrieve last PLC log id', 500);
  }
};

module.exports = {
  bulkAddErrorLogs,
  bulkUpdateErrorLogs,
  getErrorLogs,
  getLastErrorLogPlcLogId,
  bulkAddSystemLogs,
  bulkUpdateSystemLogs,
  getSystemLogs,
  getLastSystemLogPlcLogId
};
