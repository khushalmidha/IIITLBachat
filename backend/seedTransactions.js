import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/UserSchema.js";
import Transaction from "./models/TransactionModel.js";

dotenv.config({ path: "./.env" });

const seedTransactions = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("MONGO_URL is missing in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const email = "khushalmidha24@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found! Please create the account or check the email.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user._id})`);

    // Friends list for dynamic descriptions
    const friends = ["Piyush", "Tanishk", "Raghvendra", "Utkarsh", "Priyanshu", "Aditya", "Lavish", "Lakshya"];
    const places = ["Cafe Coffee Day", "Dominos", "PVR Cinemas", "Goa Trip", "Local Dhaba", "McDonalds"];

    const dummyTransactions = [];

    // Helper to get random item
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    // Helper to get random number in range
    const getAmount = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    // Helper to get random date in last 90 days
    const getRandomDate = () => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      return date;
    };

    // Generate 50 expenses
    for (let i = 0; i < 50; i++) {
      const type = Math.random() > 0.8 ? "credit" : "expense"; // 20% credits, 80% expenses
      let title = "";
      let category = "";
      let description = "";
      let amount = 0;

      if (type === "expense") {
        const expenseType = Math.random();
        if (expenseType < 0.4) {
          category = "Food";
          title = `Dinner with ${getRandom(friends)}`;
          description = `Ate at ${getRandom(places)} with ${getRandom(friends)}`;
          amount = getAmount(200, 1500);
        } else if (expenseType < 0.7) {
          category = "Entertainment";
          title = `Movie with ${getRandom(friends)}`;
          description = `Watched latest movie`;
          amount = getAmount(300, 1000);
        } else if (expenseType < 0.9) {
          category = "Travel";
          title = `Trip expense`;
          description = `Cab fare / fuel shared with ${getRandom(friends)}`;
          amount = getAmount(100, 800);
        } else {
          category = "Shopping";
          title = `Bought clothes`;
          description = `Shopping mall visit`;
          amount = getAmount(1000, 5000);
        }
      } else {
        const creditType = Math.random();
        if (creditType < 0.5) {
          category = "Salary";
          title = `Pocket Money`;
          description = `Received from parents`;
          amount = getAmount(5000, 10000);
        } else {
          category = "Freelance";
          title = `Freelance Project`;
          description = `Payment from client`;
          amount = getAmount(2000, 8000);
        }
      }

      dummyTransactions.push({
        title,
        amount,
        category,
        description,
        transactionType: type,
        date: getRandomDate(),
        user: user._id,
      });
    }

    console.log(`Inserting ${dummyTransactions.length} dummy transactions...`);
    const inserted = await Transaction.insertMany(dummyTransactions);
    
    // Update user's transactions array
    user.transactions.push(...inserted.map(t => t._id));
    await user.save();

    console.log("Successfully seeded dummy data!");
    process.exit(0);

  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedTransactions();
