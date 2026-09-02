const User = require("../models/user");
const { generateToken } = require("../middleware/authmiddleware");

const getDemoUsers = () => global.demoUsers || [];

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password",
      });
    }

    const users = getDemoUsers();
    const existing = users.find(
      (user) => user.email === email || user.username === username,
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists with that email or username",
      });
    }

    const id = String(Date.now());
    const newUser = {
      _id: id,
      username,
      email,
      password,
      role: role || "user",
    };

    users.push(newUser);
    global.demoUsers = users;

    const token = generateToken(id, newUser.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id,
        username,
        email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = getDemoUsers().find((item) => item.email === email);

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = getDemoUsers().find((item) => item._id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
