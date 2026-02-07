// API endpoint for products
// This works with Vercel Serverless Functions

const products = [
    {
        id: 1,
        name: "Premium Attar",
        price: 999,
        category: "fragrances",
        image: "images/products/attar1.jpg",
        description: "Premium quality attar with long-lasting fragrance"
    },
    {
        id: 2,
        name: "Designer Kurta",
        price: 2499,
        category: "clothes",
        image: "images/products/kurta1.jpg",
        description: "Elegant designer kurta for special occasions"
    },
    {
        id: 3,
        name: "Organic Honey",
        price: 1299,
        category: "agricultural",
        image: "images/products/honey1.jpg",
        description: "Pure organic honey from local farms"
    },
    {
        id: 4,
        name: "Cotton Bedsheet",
        price: 1999,
        category: "home-textiles",
        image: "images/products/bedsheet1.jpg",
        description: "High-quality cotton bedsheet set"
    },
    {
        id: 5,
        name: "Rose Perfume",
        price: 1499,
        category: "fragrances",
        image: "images/products/perfume1.jpg",
        description: "Elegant rose-scented perfume"
    },
    {
        id: 6,
        name: "Embroidered Shawl",
        price: 3499,
        category: "clothes",
        image: "images/products/shawl1.jpg",
        description: "Handcrafted embroidered shawl"
    }
];

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
        // Get category filter from query params if provided
        const { category } = req.query;
        
        let filteredProducts = products;
        
        if (category && category !== 'all') {
            filteredProducts = products.filter(p => p.category === category);
        }
        
        return res.status(200).json({
            success: true,
            products: filteredProducts,
            total: filteredProducts.length
        });
        
    } catch (error) {
        console.error('Products API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve products'
        });
    }
}