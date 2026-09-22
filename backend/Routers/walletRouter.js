import express from "express";
import {
  createWallet,
  generateInvite,
  joinWallet,
  getMyWallets,
  getWalletDetails,
} from "../controllers/walletController.js";

const router = express.Router();

router.route("/create").post(createWallet);
router.route("/invite").post(generateInvite);
router.route("/join/:token").post(joinWallet);
router.route("/mine").post(getMyWallets);
router.route("/:walletId").post(getWalletDetails);

export default router;
