// API endpoint for user registration
// This works with Vercel Serverless Functions

// Note: In serverless, we can't persist data between requests
// You'll need a database later (MongoDB, PostgreSQL, etc.)
// For now, this is just for demo

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }

    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
        return res.status(400).json({ 
            success: false,
            error: 'Email, password, and name are required' 
        });
    }

    // Prevent registration with admin email
    if (email === 'shayanihtiram443@gmail.com') {
        return res.status(403).json({ 
            success: false,
            error: 'This email is reserved' 
        });
    }

    // For serverless demo, just return success
    // In production, you'd save to database
    res.status(201).json({
        success: true,
        message: 'Registration successful! (Demo mode - data not persisted)',
        user: {
            id: Date.now(),
            email,
            name,
            isAdmin: false
        }
    });
}