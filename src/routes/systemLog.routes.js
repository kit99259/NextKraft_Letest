const express = require('express');
const router = express.Router();
const plcLogController = require('../controllers/plcLog.controller');
const { validateBulkAddLogs, validateBulkUpdateLogs } = require('../validators/plcLog.validator');

/**
 * @swagger
 * tags:
 *   name: SystemLogs
 *   description: PLC system log ingestion and queries (table system_logs)
 */

/**
 * @swagger
 * /api/system-logs/bulk:
 *   post:
 *     summary: Bulk add or upsert system logs by PLC log id
 *     description: |
 *       Each item uses `id` as the external PLC log id (stored as plclogId), or you may send `plclogId` instead.
 *       On duplicate PLC log id, type, key, and value are updated.
 *     tags: [SystemLogs]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [logs]
 *             properties:
 *               logs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [key, value]
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: PLC log id (same as plclogId if you prefer that name)
 *                     plclogId:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Created or updated
 *       400:
 *         description: Validation error
 */
router.post('/bulk', validateBulkAddLogs, plcLogController.bulkAddSystemLogs);

/**
 * @swagger
 * /api/system-logs/bulk:
 *   put:
 *     summary: Bulk update system logs by table row id
 *     description: Each item `id` is the primary key of system_logs.
 *     tags: [SystemLogs]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [logs]
 *             properties:
 *               logs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id]
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Table primary key
 *                     type:
 *                       type: string
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *                     plclogId:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Row not found
 */
router.put('/bulk', validateBulkUpdateLogs, plcLogController.bulkUpdateSystemLogs);

/**
 * @swagger
 * /api/system-logs:
 *   get:
 *     summary: List system logs with filters and pagination
 *     tags: [SystemLogs]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: plclogId
 *         schema: { type: integer }
 *       - in: query
 *         name: plclogIdFrom
 *         schema: { type: integer }
 *       - in: query
 *         name: plclogIdTo
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: key
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', plcLogController.getSystemLogs);

/**
 * @swagger
 * /api/system-logs/last-plclog-id:
 *   get:
 *     summary: Highest PlcLogId stored in system_logs
 *     tags: [SystemLogs]
 *     security: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/last-plclog-id', plcLogController.getLastSystemLogPlcLogId);

module.exports = router;
