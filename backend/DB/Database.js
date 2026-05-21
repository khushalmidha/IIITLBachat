import mongoose from "mongoose";

export const connectDB = async () => {
    const db = process.env.MONGO_URL;
    if (!db) {
        console.warn("MONGO_URL is not set; starting without a MongoDB connection.");
        return null;
    }

    const {connection} = await mongoose.connect(db, { useNewUrlParser: true });
    console.log(`MongoDB Connected to ${connection.host}`);

    return connection;
}
