import express from "express";
import {
  financeChatController,
  investmentInsightsController,
  investmentPlanController,
  marketTickerController,
  parseReceiptController,
  voiceExpenseController,
} from "../controllers/aiController.js";

const router = express.Router();

router.route("/receipt").post(parseReceiptController);
router.route("/chat").post(financeChatController);
router.route("/investments").post(investmentInsightsController);
router.route("/plans").post(investmentPlanController);
router.route("/market-ticker").get(marketTickerController);
router.route("/voice-expense").post(voiceExpenseController);

export default router;
