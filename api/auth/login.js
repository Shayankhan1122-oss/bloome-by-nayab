// Authentication API endpoint
// Handles admin login verification

export default async function handler(req, res) {
    // Enable CORS
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
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // CRITICAL: Only this email is authorized as admin
        const ADMIN_EMAIL = 'bloomewebstore@gmail.com';
        const ADMIN_PASSWORD = 'Pass1122@'; // Your actual admin password

        // Verify credentials
        if (email !== ADMIN_EMAIL) {
            console.log('❌ Unauthorized email attempt:', email);
            return res.status(403).json({
                success: false,
                error: 'Access denied: Unauthorized email'
            });
        }

        if (password !== ADMIN_PASSWORD) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Success - credentials match
        console.log('✅ Admin login successful:', email);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: 'admin-001',
                email: email,
                isAdmin: true,
                verified: true
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
}

export const config = {
    maxDuration: 10,
};