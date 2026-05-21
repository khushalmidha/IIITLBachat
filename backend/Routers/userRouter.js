import express from 'express';
import { googleAuthController, loginControllers, registerControllers, setAvatarController } from '../controllers/userController.js';

const router = express.Router();

router.route("/register").post(registerControllers);
router.route("/login").post(loginControllers);
router.route("/google").post(googleAuthController);
router.route("/setAvatar/:id").post(setAvatarController);

export default router;