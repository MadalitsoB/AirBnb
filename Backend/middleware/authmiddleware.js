const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  return process.env.JWT_SECRET;
};

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded.role && global.demoUsers) {
      const demoUser = global.demoUsers.find((user) => user._id === decoded.id);
      if (demoUser) decoded.role = demoUser.role;
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = { protect, generateToken };
