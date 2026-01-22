const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        email: req.user.email,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { getProfile };
