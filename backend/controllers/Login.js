//POST /api/user/signup

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.json({ success: false, message: "User already exists" });

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

  console.log("Signup OTP:", otp); // replace with email service

  res.json({ success: true, message: "OTP sent to email" });
};

//POST /api/user/verify-signup-otp

exports.verifySignupOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ success: true, token });
};

//POST /api/user/login

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.json({ success: false, message: "User not found" });

  if (!user.isVerified)
    return res.json({ success: false, message: "Email not verified" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.json({ success: false, message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ success: true, token });
};

//POST /api/user/forgot-password

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.json({ success: false, message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  console.log("Forgot OTP:", otp);

  res.json({ success: true, message: "OTP sent to email" });
};

//POST /api/user/verify-forgot-otp

exports.verifyForgotOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  const newPassword = Math.random().toString(36).slice(-8);
  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  console.log("New Password:", newPassword); // email this to user

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    success: true,
    token,
    message: "New password sent to email",
  });
};


