import validator from "validator";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary"


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          email,
          role: "admin",
          type: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ success: true, token });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log("adminLogin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Route to get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select('-password'); // Exclude password
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, userData: user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to update user profile
const updateUserProfile = async (req, res) => {
    try {
        console.log("Update Profile Request Body:", req.body);
        const { name, phone, address } = req.body;
        const imageFile = req.file;
        
        if (!name || !phone) {
            return res.json({ success: false, message: "Name and phone are required" });
        }

        const updateData = {
            name,
            phone,
            address: address ? JSON.parse(address) : undefined
        };

        if (imageFile) {
            console.log("Processing image file:", imageFile.path);
            try {
                // Normalize path for Windows to avoid backslash issues
                const normalizedPath = imageFile.path.replace(/\\/g, "/");
                const imageUpload = await cloudinary.uploader.upload(normalizedPath, { resource_type: 'image' });
                updateData.image = imageUpload.secure_url;
                console.log("Image upload success:", updateData.image);
            } catch (error) {
                console.log("Image upload failed:", error);
                // We do NOT return error here, we proceed to save other data
            }
        }

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const user = await userModel.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: "Profile Updated", userData: user });

    } catch (error) {
        console.log("Update Profile Error:", error);
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile }