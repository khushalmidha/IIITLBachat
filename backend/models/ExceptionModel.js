import mongoose from "mongoose";

const exceptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    default: null,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  category: String,
  overAmount: Number,
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  acknowledged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

exceptionSchema.index({ user: 1, acknowledged: 1 });

const Exception = mongoose.model("Exception", exceptionSchema);

export default Exception;
