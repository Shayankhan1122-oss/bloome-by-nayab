// API endpoint for user login
// This works with Vercel Serverless Functions

// In-memory user database (same as server.js)
const users = [
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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            error: 'Email and password are required' 
        });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ 
            success: false,
            error: 'Invalid credentials' 
        });
    }

    // Verify password
    if (user.password !== password) {
        return res.status(401).json({ 
            success: false,
            error: 'Invalid credentials' 
        });
    }

    // STRICT CHECK: Only the authorized admin can have isAdmin=true
    const isAuthorizedAdmin = (user.email === 'huzaifamadani95@gmail.com' && user.isAdmin === true);
    
    // Return user data (NEVER send password back)
    res.status(200).json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: isAuthorizedAdmin
        }
    });
}