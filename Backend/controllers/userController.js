const User = require("../models/user");
const { generateToken } = require("../middleware/authmiddleware");

const serializeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide username, email, and password",
        });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with that email or username",
        });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role === "host" ? "host" : "user",
    });
    res
      .status(201)
      .json({
        success: true,
        token: generateToken(user._id, user.role),
        user: serializeUser(user),
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    res
      .status(200)
      .json({
        success: true,
        token: generateToken(user._id, user.role),
        user: serializeUser(user),
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
