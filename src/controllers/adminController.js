// Admin Management for       IBREES-LIL-HUZAIFA
// Ensures only one admin can be registered

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check if admin already exists
const adminExists = async () => {
    try {
        const admin = await User.findOne({ isAdmin: true });
        return !!admin;
    } catch (error) {
        console.error('Error checking if admin exists:', error);
        return false;
    }
};

// Register the first and only admin
const registerAdmin = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false, 
                error: 'Admin user already exists. Only one admin is allowed.' 
            });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'A user with this email already exists.' 
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the admin user
        const adminUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            isAdmin: true
        });

        await adminUser.save();

        // Create JWT token
        const token = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: adminUser._id,
                email: adminUser.email,
                name: adminUser.name,
                isAdmin: adminUser.isAdmin
            }
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during admin registration' 
        });
    }
};

// Update admin profile (only admin can do this)
const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, currentPassword, newPassword } = req.body;

        // Find the admin user
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isAdmin) {
            return res.status(404).json({ 
                success: false, 
                error: 'Admin user not found' 
            });
        }

        // Update basic info
        if (name) admin.name = name;
        if (phone) admin.phone = phone;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Current password is incorrect' 
                });
            }

            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);
        }

        await admin.save();

        res.json({
            success: true,
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                isAdmin: admin.isAdmin
            }
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during admin profile update' 
        });
    }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id).select('-password');
        if (!admin || !admin.isAdmin) {
            return res.status(404).json({ 
                success: false, 
                error: 'Admin user not found' 
            });
        }

        res.json({
            success: true,
            user: admin
        });
    } catch (error) {
        console.error('Error getting admin profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during admin profile retrieval' 
        });
    }
};

module.exports = {
    adminExists,
    registerAdmin,
    updateAdminProfile,
    getAdminProfile
};