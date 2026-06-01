const express = require('express');

const activityLogController = require('../controllers/activityLogController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { idParamSchema } = require('../validators/commonSchemas');
const { createActivityLogSchema } = require('../validators/activityLogSchemas');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), asyncHandler(activityLogController.getActivityLogs));
router.post('/', authenticate, validate(createActivityLogSchema), asyncHandler(activityLogController.createActivityLog));
router.get('/:id', authenticate, authorize('admin'), validate(idParamSchema), asyncHandler(activityLogController.getActivityLog));

module.exports = router;
