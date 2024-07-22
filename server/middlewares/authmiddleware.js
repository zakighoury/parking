require("dotenv").config();
const JWT = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check for user authentication
const requireSignin = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader?.split(" ")[1]) {
      token = authHeader?.split(" ")[1];
    } else {
      token = req.cookies.auth || req.headers["x-access-token"];
    }

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode?.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    }

    req.user = { ...user._doc, userId: user._id };

    next();
  } catch (error) {
    console.error("Error in requireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};

// Middleware to check for admin role (optional for admin routes)
const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to access this resource.",
        success: false,
      });
    }
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Unauthorized",
      error: error.message,
    });
  }
};

// Middleware to allow access if user is not signed in
const notRequireSignin = async (req, res, next) => {
  try {
    const token = req?.cookies?.auth;

    if (token) {
      const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decode?.userId);

      if (!user || user.status !== "active") {
        return res.status(401).json({
          message: "Profile not found. Please login again.",
          success: false,
        });
      }

      req.user = { ...user._doc, userId: user._id };
    }

    next();
  } catch (error) {
    console.error("Error in notRequireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};

// Middleware to allow admin access to all routes
const adminAccess = (req, res, next) => {
  if (req.user.role === "admin") {
    return next(); // Admins are allowed to access all routes
  } else {
    return res.status(403).json({
      message: "Access denied for non-admin users.",
      success: false,
    });
  }
};

// Function to generate a JSON Web Token
const SignToken = (userId) => {
  return JWT.sign(
    {
      userId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = { requireSignin, isAdmin, SignToken, notRequireSignin, adminAccess };
