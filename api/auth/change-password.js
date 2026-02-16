// Change Password API endpoint
// Allows admin to change their password

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { email, currentPassword, newPassword } = req.body;

        // Validate input
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // CRITICAL: Only admin email allowed
        const ADMIN_EMAIL = 'bloomewebstore@gmail.com';
        const ADMIN_PASSWORD = 'Pass1122@'; // Current password

        if (email !== ADMIN_EMAIL) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        // Verify current password
        if (currentPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters'
            });
        }

        // NOTE: In production, you would update this in a database
        // For now, this is a demonstration endpoint
        // You'll need to manually update the ADMIN_PASSWORD in login.js
        
        console.log('⚠️ Password change requested for:', email);
        console.log('⚠️ New password:', newPassword);
        console.log('⚠️ IMPORTANT: Update ADMIN_PASSWORD in api/auth/login.js to:', newPassword);

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            note: 'Please update the ADMIN_PASSWORD constant in api/auth/login.js with your new password'
        });

    } catch (error) {
        console.error('❌ Password change error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
}

export const config = {
    maxDuration: 10,
};