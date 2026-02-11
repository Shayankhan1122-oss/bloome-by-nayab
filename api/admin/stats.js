// API endpoint for admin dashboard stats
// MongoDB Version - Real-time stats from database

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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const client = await connectToDatabase();
            const db = client.db('bloome_nayab');
            const productsCollection = db.collection('products');
            const ordersCollection = db.collection('orders');

            // Get all products and orders
            const products = await productsCollection.find({}).toArray();
            const orders = await ordersCollection.find({}).toArray();

            // Calculate stats
            const totalProducts = products.length;
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            const pendingOrders = orders.filter(order => order.status === 'pending').length;
            const lowStockProducts = products.filter(product => product.stock < 10).length;

            // Calculate this month's revenue
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const revenueThisMonth = orders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                    return orderMonth === currentMonth;
                })
                .reduce((sum, order) => sum + (order.total || 0), 0);

            // Get recent orders (last 5)
            const recentOrders = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(order => ({
                    id: order.id,
                    orderId: order.orderId,
                    customer: order.customer?.fullName || 'Guest',
                    total: order.total,
                    status: order.status,
                    date: order.createdAt
                }));

            const stats = {
                totalProducts: totalProducts,
                totalOrders: totalOrders,
                totalRevenue: totalRevenue,
                lowStockProducts: lowStockProducts,
                pendingOrders: pendingOrders,
                activeUsers: 0, // Can be implemented later
                revenueThisMonth: revenueThisMonth,
                recentOrders: recentOrders
            };

            console.log('📊 Stats calculated from MongoDB:');
            console.log('   Products:', totalProducts);
            console.log('   Orders:', totalOrders);
            console.log('   Revenue: Rs', totalRevenue.toFixed(2));

            return res.status(200).json({
                success: true,
                ...stats
            });
        } catch (error) {
            console.error('❌ Stats API error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve stats',
                message: error.message
            });
        }
    }

    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}