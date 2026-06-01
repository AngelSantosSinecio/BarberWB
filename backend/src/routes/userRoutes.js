const express = require('express');

const userController = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { idParamSchema } = require('../validators/commonSchemas');
const { setUserActiveSchema } = require('../validators/userSchemas');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), asyncHandler(userController.getUsers));
router.get('/:id', authenticate, validate(idParamSchema), asyncHandler(userController.getUser));
router.patch('/:id/active', authenticate, authorize('admin'), validate(idParamSchema), validate(setUserActiveSchema), asyncHandler(userController.setUserActive));
router.delete('/:id', authenticate, authorize('admin'), validate(idParamSchema), asyncHandler(userController.deleteUser));

module.exports = router;
