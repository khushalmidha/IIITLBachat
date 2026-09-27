import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  weeklyBudget: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

walletSchema.index({ owner: 1 });
walletSchema.index({ members: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
