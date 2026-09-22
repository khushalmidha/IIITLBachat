import express from "express";
import {
  getCurrentBudget,
  setBudget,
  getBudgetHistory,
  getExceptions,
  addExceptionMessage,
  acknowledgeException,
} from "../controllers/budgetController.js";

const router = express.Router();

router.route("/current").post(getCurrentBudget);
router.route("/set").post(setBudget);
router.route("/history").post(getBudgetHistory);
router.route("/exceptions").post(getExceptions);
router.route("/exceptions/:id/message").post(addExceptionMessage);
router.route("/exceptions/:id/acknowledge").post(acknowledgeException);

export default router;
