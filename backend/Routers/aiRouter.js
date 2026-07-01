import express from "express";
import {
  financeChatController,
   investmentInsightsController,
  investmentPlanController,
  marketTickerController,
  parseReceiptController,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/receipt").post(parseReceiptController);
router.route("/chat").post(financeChatController);
router.route("/investments").post(investmentInsightsController);
router.route("/plans").post(investmentPlanController);
router.route("/market-ticker").get(marketTickerController);

export default router;
