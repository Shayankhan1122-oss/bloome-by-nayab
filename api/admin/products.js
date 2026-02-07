// API endpoint for admin products management
// This works with Vercel Serverless Functions

// In-memory products storage (will reset on deployment)
// For production, replace with a real database
let products = [
    {
        id: 1,
        name: "Premium Perfume",
        price: 2499.99,
        category: "fragrances",
        image: "https://placehold.co/300x300/3498db/ffffff/png?text=Premium+Perfume",
        gallery: [],
        rating: 4.5,
        description: "Luxury perfume with long-lasting fragrance",
        stock: 25,
        sku: "PR-001",
        status: "active"
    },
    {
        id: 2,
        name: "Cotton Kurta",
        price: 1499.99,
        category: "clothes",
        image: "https://placehold.co/300x300/2ecc71/ffffff/png?text=Cotton+Kurta",
        gallery: [],
        rating: 4.2,
        description: "Comfortable cotton kurta for daily wear",
        stock: 15,
        sku: "CL-001",
        status: "active"
    },
    {
        id: 3,
        name: "Pure Desi Ghee",
        price: 999.99,
        category: "agricultural",
        image: "https://placehold.co/300x300/f39c12/ffffff/png?text=Desi+Ghee",
        gallery: [],
        rating: 4.8,
        description: "Pure desi ghee made from cow milk",
        stock: 40,
        sku: "AG-001",
        status: "active"
    },
    {
        id: 4,
        name: "Prayer Mat",
        price: 1999.99,
        category: "home-textiles",
        image: "https://placehold.co/300x300/9b59b6/ffffff/png?text=Prayer+Mat",
        gallery: [],
        rating: 4.3,
        description: "Soft and comfortable prayer mat",
        stock: 8,
        sku: "HT-001",
        status: "active"
    },
    {
        id: 5,
        name: "Rose Attar",
        price: 899.99,
        category: "fragrances",
        image: "https://placehold.co/300x300/e74c3c/ffffff/png?text=Rose+Attar",
        gallery: [],
        rating: 4.6,
        description: "Natural rose attar for a refreshing fragrance",
        stock: 30,
        sku: "PR-002",
        status: "active"
    },
    {
        id: 6,
        name: "Embroidered Shawl",
        price: 3499.99,
        category: "clothes",
        image: "https://placehold.co/300x300/1abc9c/ffffff/png?text=Embroidered+Shawl",
        gallery: [],
        rating: 4.7,
        description: "Beautiful hand-embroidered shawl",
        stock: 12,
        sku: "CL-002",
        status: "active"
    }
];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // GET - Fetch all products
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            products: products
        });
    }

    // POST - Add new product
    if (req.method === 'POST') {
        try {
            const newProduct = req.body;
            
            // Generate new ID
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            
            const product = {
                id: newId,
                name: newProduct.name,
                sku: newProduct.sku,
                category: newProduct.category,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                status: newProduct.status || 'active',
                description: newProduct.description || '',
                image: newProduct.image || 'images/products/placeholder.jpg',
                gallery: Array.isArray(newProduct.gallery) ? newProduct.gallery : [],
                rating: 0
            };
            
            products.push(product);
            
            return res.status(201).json({
                success: true,
                message: 'Product added successfully',
                product: product
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Failed to add product',
                message: error.message
            });
        }
    }

    // PUT - Update existing product
    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            const updates = req.body;
            
            const index = products.findIndex(p => p.id === parseInt(id));
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }
            
            // Build updated product safely
            const existing = products[index];
            const updatedProduct = {
                ...existing,
                ...updates,
                id: existing.id,
                // Preserve/override image and gallery only if provided
                image: updates.image !== undefined && updates.image !== null ? updates.image : existing.image,
                gallery: Array.isArray(updates.gallery) ? updates.gallery : existing.gallery,
                // Parse numeric fields only when provided to avoid NaN
                price: updates.price !== undefined ? parseFloat(updates.price) : existing.price,
                stock: updates.stock !== undefined ? parseInt(updates.stock) : existing.stock
            };

            products[index] = updatedProduct;
            
            return res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                product: products[index]
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Failed to update product',
                message: error.message
            });
        }
    }

    // DELETE - Remove product
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            
            const index = products.findIndex(p => p.id === parseInt(id));
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }
            
            const deletedProduct = products.splice(index, 1)[0];
            
            return res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
                product: deletedProduct
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Failed to delete product',
                message: error.message
            });
        }
    }

    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}