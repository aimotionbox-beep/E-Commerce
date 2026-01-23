import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    // 🔐 Email verification status
    isVerified: { 
      type: Boolean, 
      default: false 
    },

    // 🔢 OTP for signup & forgot password
    otp: { 
      type: String 
    },

    otpExpires: { 
      type: Date 
    },

    // 🛒 Existing cart (unchanged)
    cartData: { 
      type: Object, 
      default: {} 
    },
    
    // 📞 Phone number
    phone: { 
        type: String, 
        default: '' 
    },

    // 🖼️ Profile picture URL
    image: { 
        type: String, 
        default: '' 
    },

    // 🏠 Address details
    address: { 
        type: Object, 
        default: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipcode: '',
            country: ''
        } 
    }
  },
  { 
    minimize: false, 
    timestamps: true 
  }
);

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
