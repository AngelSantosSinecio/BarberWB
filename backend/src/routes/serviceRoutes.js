const express = require('express');

const serviceController = require('../controllers/serviceController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { idParamSchema } = require('../validators/commonSchemas');
const { createServiceSchema, updateServiceSchema } = require('../validators/serviceSchemas');

const router = express.Router();

router.get('/', asyncHandler(serviceController.getServices));
router.post('/', authenticate, authorize('admin'), validate(createServiceSchema), asyncHandler(serviceController.createService));
router.get('/:id', validate(idParamSchema), asyncHandler(serviceController.getService));
router.put('/:id', authenticate, authorize('admin'), validate(updateServiceSchema), asyncHandler(serviceController.updateService));
router.delete('/:id', authenticate, authorize('admin'), validate(idParamSchema), asyncHandler(serviceController.deleteService));

module.exports = router;
