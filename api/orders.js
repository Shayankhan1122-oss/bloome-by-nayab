// API endpoint for guest orders
// Handles order creation and retrieval

// In-memory order storage (for demo - use database in production)
const orders = [];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // POST - Create new order
    if (req.method === 'POST') {
        try {
            const orderData = req.body;
            
            // Validate required fields
            if (!orderData.orderId || !orderData.customer || !orderData.items) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required order information'
                });
            }
            
            // Validate customer info
            if (!orderData.customer.email || !orderData.customer.fullName) {
                return res.status(400).json({
                    success: false,
                    error: 'Customer name and email are required'
                });
            }
            
            // Add order to storage
            orders.push(orderData);
            
            // Return success with order details
            return res.status(200).json({
                success: true,
                orderId: orderData.orderId,
                trackingToken: orderData.trackingToken,
                message: 'Order placed successfully',
                trackingUrl: `/track-order.html?order=${orderData.orderId}&token=${orderData.trackingToken}`
            });
            
        } catch (error) {
            console.error('Order creation error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process order'
            });
        }
    }
    
    // GET - Retrieve orders (admin only for now)
    if (req.method === 'GET') {
        // Return all orders (in production, add authentication)
        return res.status(200).json({
            success: true,
            orders: orders
        });
    }
    
    // Method not allowed
    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}