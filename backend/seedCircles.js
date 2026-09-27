import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/UserSchema.js";
import Wallet from "./models/WalletModel.js";

dotenv.config({ path: "./.env" });

const familyNames = [
  "Khushal Midha",
  "Kamal Kant",
  "Sunita Midha",
  "Sanjeevani Midha"
];

const friendNames = [
  "Khushal Midha",
  "Piyush",
  "Tanishk",
  "Raghvendra",
  "Utkarsh",
  "Priyanshu",
  "Aditya",
  "Lavish",
  "Lakshya"
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Helper to get or create user
    const getOrCreateUser = async (name) => {
      const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: "password123", // Dummy password
        });
        console.log(`Created user: ${name}`);
      }
      return user;
    };

    console.log("--- Creating Family Users ---");
    const familyUsers = [];
    for (const name of familyNames) {
      familyUsers.push(await getOrCreateUser(name));
    }

    console.log("--- Creating Friend Users ---");
    const friendUsers = [];
    for (const name of friendNames) {
      friendUsers.push(await getOrCreateUser(name));
    }

    const khushal = await User.findOne({ email: "khushal.midha@example.com" });
    if (!khushal) {
        console.error("Khushal not found! Something went wrong.");
        process.exit(1);
    }

    // Create Family Wallet
    let familyWallet = await Wallet.findOne({ name: "Family Circle", owner: khushal._id });
    if (!familyWallet) {
      familyWallet = await Wallet.create({
        name: "Family Circle",
        owner: khushal._id,
        members: familyUsers.filter(u => u._id.toString() !== khushal._id.toString()).map(u => u._id)
      });
      console.log("Created Family Circle Wallet");
    } else {
      familyWallet.members = familyUsers.filter(u => u._id.toString() !== khushal._id.toString()).map(u => u._id);
      await familyWallet.save();
      console.log("Updated Family Circle Wallet");
    }

    // Create Friends Wallet
    let friendsWallet = await Wallet.findOne({ name: "Friends Circle", owner: khushal._id });
    if (!friendsWallet) {
      friendsWallet = await Wallet.create({
        name: "Friends Circle",
        owner: khushal._id,
        members: friendUsers.filter(u => u._id.toString() !== khushal._id.toString()).map(u => u._id)
      });
      console.log("Created Friends Circle Wallet");
    } else {
      friendsWallet.members = friendUsers.filter(u => u._id.toString() !== khushal._id.toString()).map(u => u._id);
      await friendsWallet.save();
      console.log("Updated Friends Circle Wallet");
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedData();
