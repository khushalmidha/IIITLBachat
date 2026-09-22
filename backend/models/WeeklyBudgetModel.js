import mongoose from "mongoose";

const weeklyBudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  weekStart: {
    type: Date,
    required: true,
  },
  categories: {
    Groceries: { type: Number, default: 0 },
    Food: { type: Number, default: 0 },
    Transportation: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Medical: { type: Number, default: 0 },
    Utilities: { type: Number, default: 0 },
    Other: { type: Number, default: 0 },
  },
  totalBudget: { type: Number, default: 0 },
});

weeklyBudgetSchema.index({ user: 1, weekStart: -1 });

const WeeklyBudget = mongoose.model("WeeklyBudget", weeklyBudgetSchema);

export default WeeklyBudget;
