import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileValidator } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfileValidator, updateProfile);

export default router;
