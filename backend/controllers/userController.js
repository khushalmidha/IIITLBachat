import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UserSchema.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const publicUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.password;
  return plainUser;
};

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerControllers = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: publicUser(newUser),
      token: signToken(newUser._id),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginControllers = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: user
          ? "Please continue with Google login for this account"
          : "Incorrect email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}`,
      user: publicUser(user),
      token: signToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const setAvatarController = async (req, res) => {
  try {
    const imageData = req.body.image;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required",
      });
    }

    if (req.params.id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot update another user's avatar",
      });
    }

    const userData = await User.findByIdAndUpdate(
      req.userId,
      {
        isAvatarImageSet: true,
        avatarImage: imageData,
      },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    return res.status(200).json({
      success: true,
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
      user: publicUser(userData),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const googleAuthController = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();

    if (!profile?.email || !profile.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: profile.name || email.split("@")[0],
        email,
        googleId: profile.sub,
        authProvider: "google",
        avatarImage: profile.picture || "",
        isAvatarImageSet: Boolean(profile.picture),
      });
    } else {
      user.googleId = user.googleId || profile.sub;
      if (!user.avatarImage && profile.picture) {
        user.avatarImage = profile.picture;
        user.isAvatarImageSet = true;
      }
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}`,
      user: publicUser(user),
      token: signToken(user._id),
    });
  } catch (err) {
    const status = err.message?.includes("Token used too late") ? 401 : 500;
    return res.status(status).json({
      success: false,
      message: status === 401 ? "Google credential has expired" : err.message,
    });
  }
};
