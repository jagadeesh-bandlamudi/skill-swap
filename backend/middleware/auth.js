const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_dev_secret';

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
// middleware/auth.js

// const protect = (req, res, next) => {
//   // your authentication logic
//   if (!req.headers.authorization) {
//     return res.status(401).json({ message: "Not authorized" });
//   }
//   // normally you decode JWT and attach user to req
//   req.user = { _id: "someUserId" }; // example, replace with real logic
//   next();
// };

// // middleware/auth.js

// // Middleware to protect private routes
// const auth = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.header("Authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ msg: "No token, authorization denied" });
//     }

//     const token = authHeader.replace("Bearer ", "");

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach user to request
//     req.user = { id: decoded.id };

//     // Optional: you can fetch full user if needed
//     // req.user = await User.findById(decoded.id).select("-password");

//     next(); // continue to next middleware/route
//   } catch (err) {
//     console.error("Auth middleware error:", err.message);
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };

// module.exports = auth; // ✅ export the function directly


// module.exports = { protect };


//module.exports = { protect };

// middleware/auth.js
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const auth = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.header("Authorization");
//     console.log("authHeader:", authHeader);

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ msg: "No token, authorization denied" });
//     }

//     const token = authHeader.replace("Bearer ", "").trim();
//     console.log("token:", token);

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("decoded:", decoded);

//     // Attach user to req — use _id to match your controllers
//     req.user = { _id: decoded.user.id };

//     next(); // Continue to route
//   } catch (err) {
//     console.error("Auth middleware error:", err.message);
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };

// module.exports = auth;


// exports.protect = auth; // named export

//module.exports = auth; // ✅ export function directly

