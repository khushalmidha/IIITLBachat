import mongoose from "mongoose";
import dotenv from "dotenv";
import moment from "moment";
import User from "./models/UserSchema.js";
import Transaction from "./models/TransactionModel.js";
import Wallet from "./models/WalletModel.js";
import WeeklyBudget from "./models/WeeklyBudgetModel.js";
import Exception from "./models/ExceptionModel.js";

dotenv.config({ path: "./.env" });

const seedUltimate = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("MONGO_URL is missing in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for Ultimate Seed");

    const email = "khushalmidha24@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found!`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name}`);

    // --- 1. CLEANUP PREVIOUS SEED DATA ---
    await Transaction.deleteMany({ user: user._id });
    await WeeklyBudget.deleteMany({ user: user._id });
    await Exception.deleteMany({ user: user._id });
    user.transactions = [];
    await user.save();
    console.log("Cleaned up old transactions and budgets.");

    // --- 2. CREATE WALLETS & MEMBERS ---
    const getOrCreateUser = async (name) => {
      const uEmail = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      let u = await User.findOne({ email: uEmail });
      if (!u) {
        u = await User.create({ name, email: uEmail, password: "password123" });
      }
      return u;
    };

    const family = ["Kamal Kant", "Sunita Midha", "Sanjeevani Midha"];
    const friends = ["Piyush", "Tanishk", "Raghvendra", "Utkarsh", "Priyanshu", "Aditya", "Lavish", "Lakshya"];
    const roommates = ["Piyush", "Lakshya", "Lavish"];

    const resolveUsers = async (names) => {
      const arr = [];
      for (const n of names) arr.push(await getOrCreateUser(n));
      return arr.map(u => u._id);
    };

    const familyIds = await resolveUsers(family);
    const friendsIds = await resolveUsers(friends);
    const roomieIds = await resolveUsers(roommates);

    // Upsert Wallets
    const upsertWallet = async (name, members) => {
      let w = await Wallet.findOne({ name, owner: user._id });
      if (!w) {
        w = await Wallet.create({ name, owner: user._id, members });
      } else {
        w.members = members;
        await w.save();
      }
    };

    await upsertWallet("Family Circle", familyIds);
    await upsertWallet("Friends Circle", friendsIds);
    await upsertWallet("Flatmates Expense", roomieIds);
    console.log("Created 3 Wallets (Family, Friends, Flatmates)!");

    // --- 3. SET WEEKLY BUDGET ---
    const weekStart = moment().startOf("isoWeek").toDate();
    const budgetCategories = {
      Groceries: 2000,
      Food: 1500,
      Transportation: 1000,
      Entertainment: 2500,
      Medical: 500,
      Utilities: 1000,
      Other: 1000,
    };
    const totalBudget = Object.values(budgetCategories).reduce((a, b) => a + b, 0);

    await WeeklyBudget.create({
      user: user._id,
      weekStart,
      categories: budgetCategories,
      totalBudget
    });
    console.log(`Created Weekly Budget starting ${weekStart.toDateString()}`);

    // --- 4. GENERATE 150 TRANSACTIONS ---
    const dummyTransactions = [];
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getAmount = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    
    // Spread over the last 150 days
    for (let i = 0; i < 150; i++) {
      const date = moment().subtract(i, "days").toDate();
      const isCredit = Math.random() > 0.85; 

      if (isCredit) {
        const type = Math.random();
        if (type < 0.6) {
          dummyTransactions.push({
            title: "Monthly Allowance",
            amount: getAmount(10000, 15000),
            category: "Salary",
            description: "Received from parents",
            transactionType: "credit",
            date,
            user: user._id
          });
        } else {
          dummyTransactions.push({
            title: "Freelance UI Project",
            amount: getAmount(2000, 8000),
            category: "Freelance",
            description: "Client payment for React app",
            transactionType: "credit",
            date,
            user: user._id
          });
        }
      } else {
        const catRand = Math.random();
        let cat = "";
        let title = "";
        let desc = "";
        let amt = 0;

        if (catRand < 0.25) {
          cat = "Food";
          title = `Dinner at ${getRandom(["Dominos", "Subway", "Local Dhaba", "Burger King"])}`;
          desc = `Ate out with ${getRandom(friends)}`;
          amt = getAmount(150, 800);
        } else if (catRand < 0.45) {
          cat = "Transportation";
          title = `Uber to ${getRandom(["College", "Mall", "Station", "Airport"])}`;
          desc = `Shared ride with ${getRandom(roommates)}`;
          amt = getAmount(80, 400);
        } else if (catRand < 0.60) {
          cat = "Entertainment";
          title = `${getRandom(["Movie Night", "Bowling", "Concert", "Gaming"])}`;
          desc = `Fun weekend with friends`;
          amt = getAmount(300, 1500);
        } else if (catRand < 0.75) {
          cat = "Groceries";
          title = `Weekly Groceries`;
          desc = `Blinkit / Zepto order`;
          amt = getAmount(400, 1200);
        } else if (catRand < 0.85) {
          cat = "Utilities";
          title = `Electricity / WiFi Bill`;
          desc = `Paid flat bills`;
          amt = getAmount(800, 2000);
        } else if (catRand < 0.90) {
          cat = "Medical";
          title = `Pharmacy`;
          desc = `Medicines`;
          amt = getAmount(100, 500);
        } else {
          cat = "Other";
          title = `Random Expense`;
          desc = `Miscellaneous`;
          amt = getAmount(50, 300);
        }

        dummyTransactions.push({
          title, amount: amt, category: cat, description: desc, transactionType: "expense", date, user: user._id
        });
      }
    }

    // Explicitly add some transactions FOR THIS WEEK that EXCEED the budget to trigger Budget Exceptions!
    const thisWeek = moment().startOf("isoWeek").add(2, 'days').toDate();
    dummyTransactions.push({
      title: "Extravagant Party", amount: 4000, category: "Entertainment", description: "Blew the budget!", transactionType: "expense", date: thisWeek, user: user._id
    });
    dummyTransactions.push({
      title: "Bulk Groceries", amount: 3000, category: "Groceries", description: "Stocked up for a month", transactionType: "expense", date: thisWeek, user: user._id
    });

    console.log(`Inserting ${dummyTransactions.length} transactions...`);
    const inserted = await Transaction.insertMany(dummyTransactions);
    
    user.transactions.push(...inserted.map(t => t._id));
    await user.save();

    console.log("Successfully seeded ALL dummy data and limits!");
    process.exit(0);

  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedUltimate();
