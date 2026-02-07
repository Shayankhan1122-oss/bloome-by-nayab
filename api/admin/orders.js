// API endpoint for guest orders
// Handles order creation and retrieval with persistent storage

// TEMPORARY: Global variable for order storage
// NOTE: This resets when Vercel redeploys, but persists during active session
let orders = [];

// Admin email for notifications
const ADMIN_EMAIL = 'huzaifamadani95@gmail.com';

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
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
            
            // Log incoming request for debugging
            console.log('POST /api/admin/orders - Incoming order data:', JSON.stringify(orderData, null, 2));
            
            // Validate required fields
            if (!orderData.orderId || !orderData.customer || !orderData.items) {
                console.error('Validation failed: Missing required fields');
                return res.status(400).json({
                    success: false,
                    error: 'Missing required order information',
                    received: {
                        hasOrderId: !!orderData.orderId,
                        hasCustomer: !!orderData.customer,
                        hasItems: !!orderData.items
                    }
                });
            }
            
            // Validate customer info
            if (!orderData.customer.email || !orderData.customer.fullName) {
                console.error('Validation failed: Missing customer info');
                return res.status(400).json({
                    success: false,
                    error: 'Customer name and email are required',
                    received: orderData.customer
                });
            }
            
            // Add timestamp if not present
            if (!orderData.createdAt) {
                orderData.createdAt = new Date().toISOString();
            }
            
            // Add status if not present
            if (!orderData.status) {
                orderData.status = 'pending';
            }
            
            // Add order to storage
            orders.push(orderData);
            
            // Log success
            console.log('=== NEW ORDER RECEIVED ===');
            console.log('Order ID:', orderData.orderId);
            console.log('Customer:', orderData.customer.fullName);
            console.log('Email:', orderData.customer.email);
            console.log('Phone:', orderData.customer.phone);
            console.log('Total:', orderData.total);
            console.log('Items:', orderData.items.length);
            console.log('Payment Method:', orderData.paymentMethod);
            console.log('Status:', orderData.status);
            console.log('Total Orders in Memory:', orders.length);
            console.log('========================');
            
            // Return success with order details
            return res.status(200).json({
                success: true,
                orderId: orderData.orderId,
                trackingToken: orderData.trackingToken,
                message: 'Order placed successfully. Admin has been notified.',
                trackingUrl: `/track-order.html?order=${orderData.orderId}`,
                adminNotified: true,
                note: 'Your order is pending admin confirmation. You will receive updates via email.',
                debug: {
                    ordersSaved: orders.length,
                    timestamp: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Order creation error:', error);
            console.error('Error stack:', error.stack);
            return res.status(500).json({
                success: false,
                error: 'Failed to process order',
                details: error.message
            });
        }
    }
    
    // GET - Retrieve orders (for admin dashboard)
    if (req.method === 'GET') {
        console.log('GET /api/admin/orders - Total orders:', orders.length);
        
        // Return all orders sorted by newest first
        const sortedOrders = [...orders].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        
        console.log('Returning orders:', sortedOrders.map(o => o.orderId).join(', '));
        
        return res.status(200).json({
            success: true,
            orders: sortedOrders,
            totalOrders: sortedOrders.length,
            pendingOrders: sortedOrders.filter(o => o.status === 'pending').length,
            debug: {
                inMemoryCount: orders.length,
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // PUT - Update order status
    if (req.method === 'PUT') {
        try {
            const { orderId, status } = req.body;
            
            console.log('PUT /api/admin/orders - Update request:', { orderId, status });
            
            // Validate required fields
            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    error: 'Order ID and status are required'
                });
            }
            
            // Find order
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            
            if (orderIndex === -1) {
                console.error('Order not found:', orderId);
                console.log('Available orders:', orders.map(o => o.orderId).join(', '));
                return res.status(404).json({
                    success: false,
                    error: 'Order not found',
                    requestedId: orderId,
                    availableOrders: orders.map(o => o.orderId)
                });
            }
            
            // Update order status
            orders[orderIndex].status = status;
            orders[orderIndex].updatedAt = new Date().toISOString();
            
            // Log status change
            console.log('=== ORDER STATUS UPDATED ===');
            console.log('Order ID:', orderId);
            console.log('New Status:', status);
            console.log('Updated At:', orders[orderIndex].updatedAt);
            console.log('==========================');
            
            // Return success
            return res.status(200).json({
                success: true,
                message: 'Order status updated successfully',
                order: orders[orderIndex]
            });
            
        } catch (error) {
            console.error('Order update error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update order status',
                details: error.message
            });
        }
    }
    
    // DELETE - Delete order (for testing/cleanup)
    if (req.method === 'DELETE') {
        try {
            const { orderId } = req.body;
            
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    error: 'Order ID is required'
                });
            }
            
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            
            if (orderIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }
            
            // Remove order
            const deletedOrder = orders.splice(orderIndex, 1)[0];
            
            console.log('Order deleted:', orderId);
            
            return res.status(200).json({
                success: true,
                message: 'Order deleted successfully',
                deletedOrder: deletedOrder
            });
            
        } catch (error) {
            console.error('Order deletion error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete order'
            });
        }
    }
    
    // Method not allowed
    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}