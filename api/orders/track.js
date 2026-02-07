// API endpoint for order tracking
// Allows customers to track their order status

// Demo orders storage (shared with orders.js - use database in production)
// For now, we'll return demo data based on order ID

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }
    
    try {
        // Get order ID and tracking token from query params
        const { orderId, token } = req.query;
        
        if (!orderId || !token) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and tracking token are required'
            });
        }
        
        // In production, fetch from database
        // For demo, return sample tracking data
        
        // Validate token format (basic security)
        if (token.length < 10) {
            return res.status(401).json({
                success: false,
                error: 'Invalid tracking token'
            });
        }
        
        // Demo order data
        const orderTracking = {
            orderId: orderId,
            status: 'processing', // pending, processing, shipped, delivered, cancelled
            customerName: 'Guest Customer',
            email: 'customer@example.com',
            orderDate: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            trackingHistory: [
                {
                    status: 'Order Placed',
                    date: new Date().toISOString(),
                    description: 'Your order has been received and is being processed'
                },
                {
                    status: 'Processing',
                    date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    description: 'Your order is being prepared for shipment'
                }
            ],
            items: [
                {
                    name: 'Sample Product',
                    quantity: 1,
                    price: 999
                }
            ],
            total: 999,
            shippingAddress: {
                address: 'Sample Address',
                city: 'Sample City',
                state: 'Sample State',
                postalCode: '00000'
            }
        };
        
        return res.status(200).json({
            success: true,
            order: orderTracking
        });
        
    } catch (error) {
        console.error('Tracking error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve order information'
        });
    }
}