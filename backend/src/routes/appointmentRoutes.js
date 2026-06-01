const express = require('express');

const appointmentController = require('../controllers/appointmentController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { idParamSchema } = require('../validators/commonSchemas');
const {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  confirmAppointmentByEmailSchema
} = require('../validators/appointmentSchemas');

const router = express.Router();

router.get('/', authenticate, asyncHandler(appointmentController.getAppointments));
router.post('/', authenticate, validate(createAppointmentSchema), asyncHandler(appointmentController.createAppointment));
router.post('/confirm-email', validate(confirmAppointmentByEmailSchema), asyncHandler(appointmentController.confirmAppointmentByEmail));
router.patch('/:id/status', authenticate, authorize('admin', 'barbero'), validate(updateAppointmentStatusSchema), asyncHandler(appointmentController.updateAppointmentStatus));
router.get('/:id', authenticate, validate(idParamSchema), asyncHandler(appointmentController.getAppointment));

module.exports = router;
