const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Route to authenticate admin login
router.post("/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if admin exists
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password comparison result:', isMatch); // True or false
        console.log('Stored hash:', admin.password); // To check if it matches the expected hash

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create and return JWT token
        const payload = {
            admin: {
                id: admin.id,
                role: admin.role,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    role: admin.role,
                    token,
                    message: "Admin logged in successfully"
                });
            }
        );
    } catch (error) {
        console.error("Error logging in admin:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
