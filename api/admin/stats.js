// API endpoint for admin dashboard stats
// This works with Vercel Serverless Functions

// Sample products data - in production this would come from a database
const productsData = [
    { id: 1, name: 'Premium Attar', price: 2500, stock: 15, category: 'Fragrances' },
    { id: 2, name: 'Luxury Perfume Set', price: 4500, stock: 8, category: 'Fragrances' },
    { id: 3, name: 'Rose Attar', price: 1800, stock: 20, category: 'Fragrances' },
    { id: 4, name: 'Musk Collection', price: 3200, stock: 5, category: 'Fragrances' },
    { id: 5, name: 'Oud Special', price: 5500, stock: 3, category: 'Fragrances' },
    { id: 6, name: 'Sandalwood Essence', price: 2800, stock: 12, category: 'Fragrances' }
];

// Sample orders data - in production this would come from a database
const ordersData = [
    { id: 1, total: 2500, status: 'completed', date: '2026-01-15' },
    { id: 2, total: 4500, status: 'pending', date: '2026-01-16' },
    { id: 3, total: 1800, status: 'completed', date: '2026-01-17' },
    { id: 4, total: 3200, status: 'processing', date: '2026-01-18' }
];

export default function handler(req, res) {
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
            // Calculate stats from data
            const totalProducts = productsData.length;
            const totalOrders = ordersData.length;
            const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
            const pendingOrders = ordersData.filter(order => order.status === 'pending').length;
            const lowStockProducts = productsData.filter(product => product.stock < 10).length;

            // Calculate this month's revenue (January 2026)
            const currentMonth = '2026-01';
            const revenueThisMonth = ordersData
                .filter(order => order.date.startsWith(currentMonth))
                .reduce((sum, order) => sum + order.total, 0);

            const stats = {
                totalProducts: totalProducts,
                totalOrders: totalOrders,
                totalRevenue: totalRevenue,
                lowStockProducts: lowStockProducts,
                pendingOrders: pendingOrders,
                activeUsers: 0, // Would come from user database
                revenueThisMonth: revenueThisMonth,
                recentOrders: ordersData.slice(-5).reverse() // Last 5 orders
            };

            return res.status(200).json({
                success: true,
                ...stats
            });
        } catch (error) {
            console.error('Stats API error:', error);
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