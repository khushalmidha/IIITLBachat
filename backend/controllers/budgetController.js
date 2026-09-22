import moment from "moment";
import WeeklyBudget from "../models/WeeklyBudgetModel.js";
import Transaction from "../models/TransactionModel.js";
import Exception from "../models/ExceptionModel.js";

// Helper: get Monday of the current ISO week
const getCurrentWeekStart = () => moment().startOf("isoWeek").toDate();

export const getCurrentBudget = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const weekStart = getCurrentWeekStart();
    const weekEnd = moment(weekStart).endOf("isoWeek").toDate();

    // Get budget
    const budget = await WeeklyBudget.findOne({ user: userId, weekStart });

    // Get actual spending per category for this week
    const pipeline = [
      {
        $match: {
          user: (await import("mongoose")).default.Types.ObjectId.createFromHexString(userId),
          transactionType: "expense",
          date: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ];

    const spending = await Transaction.aggregate(pipeline);
    const spendingMap = {};
    let totalSpent = 0;
    spending.forEach(({ _id, total }) => {
      spendingMap[_id] = total;
      totalSpent += total;
    });

    return res.status(200).json({
      success: true,
      budget: budget || null,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      spending: spendingMap,
      totalSpent,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const setBudget = async (req, res) => {
  try {
    const { userId, categories = {}, totalBudget = 0 } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const weekStart = getCurrentWeekStart();

    const budget = await WeeklyBudget.findOneAndUpdate(
      { user: userId, weekStart },
      {
        user: userId,
        weekStart,
        categories: {
          Groceries: categories.Groceries || 0,
          Food: categories.Food || 0,
          Transportation: categories.Transportation || 0,
          Entertainment: categories.Entertainment || 0,
          Medical: categories.Medical || 0,
          Utilities: categories.Utilities || 0,
          Other: categories.Other || 0,
        },
        totalBudget: totalBudget || Object.values(categories).reduce((s, v) => s + (v || 0), 0),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Budget set successfully",
      budget,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBudgetHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const fourWeeksAgo = moment().startOf("isoWeek").subtract(4, "weeks").toDate();

    const budgets = await WeeklyBudget.find({
      user: userId,
      weekStart: { $gte: fourWeeksAgo },
    }).sort({ weekStart: -1 });

    return res.status(200).json({
      success: true,
      budgets,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Exception controllers ──

export const getExceptions = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const exceptions = await Exception.find({
      user: userId,
      acknowledged: false,
    })
      .populate("transactionId", "title amount category date")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, exceptions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addExceptionMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const { id } = req.params;

    if (!userId || !text) {
      return res.status(400).json({ success: false, message: "userId and text are required" });
    }

    const exception = await Exception.findById(id);
    if (!exception) {
      return res.status(404).json({ success: false, message: "Exception not found" });
    }

    exception.messages.push({ sender: userId, text });
    await exception.save();

    return res.status(200).json({ success: true, exception });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const acknowledgeException = async (req, res) => {
  try {
    const { id } = req.params;

    const exception = await Exception.findByIdAndUpdate(
      id,
      { acknowledged: true },
      { new: true }
    );

    if (!exception) {
      return res.status(404).json({ success: false, message: "Exception not found" });
    }

    return res.status(200).json({ success: true, exception });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
