const express = require('express');

const barberController = require('../controllers/barberController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { idParamSchema } = require('../validators/commonSchemas');
const { createBarberSchema, updateBarberSchema } = require('../validators/barberSchemas');

const router = express.Router();

router.get('/', asyncHandler(barberController.getBarbers));
router.post('/', authenticate, authorize('admin'), validate(createBarberSchema), asyncHandler(barberController.createBarber));
router.get('/:id', validate(idParamSchema), asyncHandler(barberController.getBarber));
router.put('/:id', authenticate, authorize('admin'), validate(updateBarberSchema), asyncHandler(barberController.updateBarber));
router.delete('/:id', authenticate, authorize('admin'), validate(idParamSchema), asyncHandler(barberController.deleteBarber));

module.exports = router;
