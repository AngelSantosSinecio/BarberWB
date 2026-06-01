const express = require('express');

const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validateMiddleware');
const { loginSchema, registerSchema, verifyEmailSchema } = require('../validators/authSchemas');

const router = express.Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(authController.verifyEmail));

module.exports = router;
