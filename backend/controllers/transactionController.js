import moment from "moment";
import Transaction from "../models/TransactionModel.js";

const transactionFields = [
  "title",
  "amount",
  "description",
  "date",
  "category",
  "transactionType",
];

export const addTransactionController = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      transactionType,
    } = req.body;

    if (
      !title ||
      !amount ||
      !description ||
      !date ||
      !category ||
      !transactionType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: req.userId,
      transactionType: String(transactionType).toLowerCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction: newTransaction,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllTransactionController = async (req, res) => {
  try {
    const {
      type = "all",
      frequency = "custom",
      startDate,
      endDate,
      category,
      page = 1,
      limit = 100,
    } = req.body;

    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.min(
      1000,
      Math.max(1, Number.parseInt(limit, 10) || 100)
    );
    const query = { user: req.userId };

    if (type !== "all") {
      query.transactionType = String(type).toLowerCase();
    }

    if (category) {
      query.category = String(category);
    }

    if (frequency !== "custom") {
      const days = Number(frequency);
      if (Number.isFinite(days) && days > 0) {
        query.date = {
          $gt: moment().subtract(days, "days").toDate(),
        };
      }
    } else if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).startOf("day").toDate(),
        $lte: moment(endDate).endOf("day").toDate(),
      };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit),
      Transaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      total,
      page: parsedPage,
      limit: parsedLimit,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteTransactionController = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction successfully deleted",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateTransactionController = async (req, res) => {
  try {
    const updates = transactionFields.reduce((result, field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        result[field] =
          field === "transactionType"
            ? String(req.body[field]).toLowerCase()
            : req.body[field];
      }
      return result;
    }, {});

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
