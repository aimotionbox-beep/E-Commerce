import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";

/* ================== TOKEN HELPER ================== */
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ================== USER SIGNUP ================== */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email address" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    /* ✅ SEND RESPONSE FIRST (CRITICAL) */
    res.json({ success: true, message: "OTP sent to email" });

    /* ✅ SEND EMAIL ASYNC (NO await) */
    sendEmail(
      email,
      "Verify your email",
      `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
    ).catch((err) => {
      console.error("Signup email failed:", err.message);
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/* ================== VERIFY SIGNUP OTP ================== */
const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = createToken(user._id);
    res.json({ success: true, token });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/* ================== USER LOGIN ================== */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.json({ success: false, message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });

  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/* ================== FORGOT PASSWORD ================== */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    /* ✅ respond immediately */
    res.json({ success: true, message: "OTP sent to email" });

    /* ✅ async email */
    sendEmail(
      email,
      "Password Reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Your OTP:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
    ).catch((err) => {
      console.error("Forgot password email failed:", err.message);
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/* ================== VERIFY FORGOT OTP ================== */
const verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "New password sent to email",
    });

    sendEmail(
      email,
      "Password Reset",
      `
        <h2>New Password</h2>
        <h1>${newPassword}</h1>
        <p>Please change it after login</p>
      `
    ).catch((err) => {
      console.error("Reset password email failed:", err.message);
    });

  } catch (error) {
    console.error("Verify forgot OTP error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

/* ================== ADMIN LOGIN ================== */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.error("Admin login error:", error);
    res.json({ success: false, message: "Server error" });
  }
};

export {
  signup,
  verifySignupOTP,
  login,
  forgotPassword,
  verifyForgotOTP,
  adminLogin,
};
