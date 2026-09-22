import crypto from "crypto";
import Wallet from "../models/WalletModel.js";
import Invite from "../models/InviteModel.js";
import User from "../models/UserSchema.js";

export const createWallet = async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ success: false, message: "userId and name are required" });
    }

    const wallet = await Wallet.create({
      name,
      owner: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Wallet created successfully",
      wallet,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateInvite = async (req, res) => {
  try {
    const { userId, walletId } = req.body;
    if (!userId || !walletId) {
      return res.status(400).json({ success: false, message: "userId and walletId are required" });
    }

    // Verify user is the wallet owner
    const wallet = await Wallet.findOne({ _id: walletId, owner: userId });
    if (!wallet) {
      return res.status(403).json({ success: false, message: "Only the wallet owner can generate invites" });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invite = await Invite.create({
      walletId,
      createdBy: userId,
      token,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      message: "Invite generated",
      token: invite.token,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const joinWallet = async (req, res) => {
  try {
    const { userId } = req.body;
    const { token } = req.params;

    if (!userId || !token) {
      return res.status(400).json({ success: false, message: "userId and token are required" });
    }

    const invite = await Invite.findOne({ token, used: false });
    if (!invite) {
      return res.status(404).json({ success: false, message: "Invalid or expired invite token" });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(410).json({ success: false, message: "Invite has expired" });
    }

    // Check user is not the wallet owner
    const wallet = await Wallet.findById(invite.walletId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    if (wallet.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: "You cannot join your own wallet" });
    }

    if (wallet.supporter) {
      return res.status(400).json({ success: false, message: "This wallet already has a supporter" });
    }

    wallet.supporter = userId;
    await wallet.save();

    invite.used = true;
    await invite.save();

    return res.status(200).json({
      success: true,
      message: "Successfully joined wallet",
      wallet,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyWallets = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const wallets = await Wallet.find({
      $or: [{ owner: userId }, { supporter: userId }],
    })
      .populate("owner", "name email avatarImage")
      .populate("supporter", "name email avatarImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, wallets });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getWalletDetails = async (req, res) => {
  try {
    const { userId } = req.body;
    const { walletId } = req.params;

    if (!userId || !walletId) {
      return res.status(400).json({ success: false, message: "userId and walletId are required" });
    }

    const wallet = await Wallet.findOne({
      _id: walletId,
      $or: [{ owner: userId }, { supporter: userId }],
    })
      .populate("owner", "name email avatarImage")
      .populate("supporter", "name email avatarImage");

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
