// API endpoint for guest orders
// MongoDB Version - Orders persist permanently

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('bloome_nayab');
        const ordersCollection = db.collection('orders');
    
        // POST - Create new order
        if (req.method === 'POST') {
            const orderData = req.body;
            
            console.log('📦 Incoming order data');
            
            // Get last order ID
            const lastOrder = await ordersCollection.find({}).sort({ id: -1 }).limit(1).toArray();
            const newId = lastOrder.length > 0 ? lastOrder[0].id + 1 : 1;
            
            // Create order object with CORRECT structure
            const order = {
                id: newId,
                orderId: orderData.orderId,
                customer: {
                    fullName: orderData.customer?.fullName || orderData.customerName,
                    email: orderData.customer?.email || orderData.email,
                    phone: orderData.customer?.phone || orderData.phone,
                },
                shippingAddress: {
                    address: orderData.shippingAddress?.address || orderData.address,
                    city: orderData.shippingAddress?.city || orderData.city,
                    state: orderData.shippingAddress?.state || orderData.state,
                    zip: orderData.shippingAddress?.zip || orderData.zip || '',
                    country: 'Pakistan'
                },
                items: orderData.items || [],
                subtotal: parseFloat(orderData.subtotal || 0),
                shipping: parseFloat(orderData.shipping || 0),
                tax: parseFloat(orderData.tax || 0),
                total: parseFloat(orderData.total || 0),
                paymentMethod: 'Cash on Delivery',
                status: orderData.status || 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save to MongoDB
            await ordersCollection.insertOne(order);
            
            console.log('✅ Order saved:', order.orderId);
            
            return res.status(200).json({
                success: true,
                orderId: order.orderId,
                message: 'Order placed successfully',
                trackingUrl: `/track-order.html?order=${order.orderId}`
            });
        }
        
        // GET - Retrieve orders
        if (req.method === 'GET') {
            const { orderId } = req.query;
            
            if (orderId) {
                // Get specific order
                const order = await ordersCollection.findOne({ orderId: orderId });
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        error: 'Order not found'
                    });
                }
                return res.status(200).json({
                    success: true,
                    order: order
                });
            } else {
                // Get all orders (for admin)
                const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
                
                return res.status(200).json({
                    success: true,
                    orders: orders,
                    totalOrders: orders.length,
                    pendingOrders: orders.filter(o => o.status === 'pending').length
                });
            }
        }
        
        // PUT - Update order status
        if (req.method === 'PUT') {
            const { orderId, status } = req.body;
            
            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    error: 'Order ID and status are required'
                });
            }
            
            const result = await ordersCollection.updateOne(
                { orderId: orderId },
                { 
                    $set: { 
                        status: status,
                        updatedAt: new Date().toISOString()
                    }
                }
            );
            
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }
            
            console.log('✅ Order updated:', orderId, '→', status);
            
            return res.status(200).json({
                success: true,
                message: 'Order status updated successfully'
            });
        }
        
        // DELETE - Delete order
        if (req.method === 'DELETE') {
            const { orderId } = req.body;
            
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    error: 'Order ID is required'
                });
            }
            
            const result = await ordersCollection.deleteOne({ orderId: orderId });
            
            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }
            
            console.log('✅ Order deleted:', orderId);
            
            return res.status(200).json({
                success: true,
                message: 'Order deleted successfully'
            });
        }
        
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error) {
        console.error('❌ MongoDB Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: error.message
        });
    }
}

export const config = {
    maxDuration: 30,
};