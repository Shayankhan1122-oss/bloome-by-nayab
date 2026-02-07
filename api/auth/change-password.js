// API endpoint for changing password
// This works with Vercel Serverless Functions

// In-memory user database (shared with login.js)
let users = [
    {
        id: 1,
        email: "huzaifamadani95@gmail.com",
        password: "636363",
        name: "Admin User",
        phone: "+92 300 1234567",
        isAdmin: true
    }
];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }

    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ 
            success: false,
            error: 'Email, current password, and new password are required' 
        });
    }

    // Validate new password length
    if (newPassword.length < 8) {
        return res.status(400).json({ 
            success: false,
            error: 'New password must be at least 8 characters long' 
        });
    }

    // Find user by email
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        return res.status(401).json({ 
            success: false,
            error: 'Invalid credentials' 
        });
    }

    const user = users[userIndex];

    // Verify current password
    if (user.password !== currentPassword) {
        return res.status(401).json({ 
            success: false,
            error: 'Current password is incorrect' 
        });
    }

    // SECURITY CHECK: Only authorized admin can change password
    if (user.email !== 'huzaifamadani95@gmail.com' || user.isAdmin !== true) {
        return res.status(403).json({ 
            success: false,
            error: 'Unauthorized' 
        });
    }

    // Update password
    users[userIndex].password = newPassword;

    // Return success
    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
} 
